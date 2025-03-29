import { View, Text, Image, Button, Input, ITouchEvent } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState, useMemo, useCallback } from 'react';
import Loading from '@/Components/Loading';
import { useStreamOutput } from '@/hooks/useStreamOutput';
import { useChatStore } from '@/store/chatStore';
import style from './index.module.scss';

const Analysis = () => {
  const DefaultDream = '';
  const { activeRequests, initChat, getChatState, sendMessage, clearChat, setChatState } =
    useChatStore();
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const chatState = getChatState(currentChatId || '');

  // 滚动到底部功能
  const scrollToTop = useCallback(() => {
    Taro.nextTick(() => {
      const query = Taro.createSelectorQuery();
      query
        .select('#chat-area')
        .boundingClientRect()
        .exec((res) => {
          if (res && res[0]) {
            Taro.pageScrollTo({
              scrollTop: res[0].height,
              duration: 300,
            });
          }
        });
    });
  }, []);

  const setMessage = useCallback(
    (message: string, _chatId: string) => {
      if (!currentChatId && !_chatId) return;
      console.log('chatId', _chatId, currentChatId);
      const chatId = _chatId || currentChatId;

      // 每次都重新获取最新状态
      const currentChatState = getChatState(chatId);
      // console.log('currentChatState', currentChatState);

      if (!currentChatState) return;

      const updateMessage = [...(currentChatState.messages || [])];

      if (updateMessage.length > 0) {
        // 更新最后一条消息
        const lastMessage = {
          ...updateMessage[updateMessage.length - 1],
          chatting: false,
          message, // 使用新接收到的完整消息替换
        };

        updateMessage[updateMessage.length - 1] = lastMessage;

        // 直接触发状态更新
        setChatState(chatId, {
          ...currentChatState,
          messages: updateMessage,
        });

        // 消息更新后滚动到底部
        setTimeout(() => {
          scrollToTop();
        }, 100);
      }
    },
    [currentChatId, getChatState, setChatState, scrollToTop]
  );

  const {
    loading: streamLoading,
    onChunkReceived,
    onStreamError,
    onStreamComplete,
    startStream,
  } = useStreamOutput({ setMessage });
  const chatId = Taro.getCurrentInstance()?.router?.params?.chatId as string;

  const isInputDisabled = useMemo(() => {
    if (!currentChatId) return true;
    return (
      !inputMessage.trim() ||
      activeRequests > 0 ||
      streamLoading ||
      chatState?.messages.some((msg) => msg.chatting)
    );
  }, [currentChatId, inputMessage, activeRequests, chatState, streamLoading]);

  const onMessageInput = (e: ITouchEvent) => {
    setInputMessage(e.detail.value);
  };

  // useEffect(() => {
  //   if (chatState?.messages && chatState.messages.length > 0) {
  //     scrollToTop();
  //   }
  // }, [chatState?.messages]);

  // 确保内容更新后滚动
  useEffect(() => {
    if (chatState?.messages && chatState.messages.length > 0) {
      setTimeout(() => {
        scrollToTop();
      }, 200);
    }
  }, [chatState?.messages, scrollToTop]);

  const handleSendMessage = async () => {
    if (!inputMessage || !inputMessage.trim() || !currentChatId) return;
    const message = inputMessage.trim();
    setInputMessage('');
    try {
      await sendMessage({
        chatId: currentChatId,
        message,
        sse: {
          startStream,
          onChunkReceived,
          onError: onStreamError,
          onComplete: onStreamComplete,
        },
      });
      scrollToTop();
    } catch (error) {
      Taro.showToast({
        title: error.message || '发送失败',
        icon: 'none',
      });
    }
  };

  const init = async () => {
    try {
      setLoading(true);
      const finalChatId = await initChat(chatId, {
        startStream,
        onChunkReceived: (chunk) => {
          const r = onChunkReceived(chunk);
          setLoading(false);
          return r;
        },
        onError: onStreamError,
        onComplete: onStreamComplete,
      });
      setCurrentChatId(finalChatId);
      setLoading(false);
    } catch (error) {
      Taro.showToast({
        title: error.message || '加载失败',
        icon: 'none',
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
    return () => {
      if (currentChatId) {
        clearChat(currentChatId);
      }
    };
  }, []);

  if (process.env.TARO_ENV !== 'h5') {
    require('@tarojs/taro/html.css');
  }

  return (
    <>
      {currentChatId && chatState?.dreamData && !loading && (
        <View className={style['container']}>
          <View className={style['header']}>
            <Text className={style['title']}>{chatState.dreamData.title}</Text>
            <Text className={style['date']}>
              {chatState.dreamData.date} {chatState.dreamData.week}
            </Text>
          </View>

          <View className={style['dream-content-wrapper']}>
            <View className={style['dream-content']}>{chatState.dreamData.desc}</View>
          </View>

          <View className={style['dream-image']}>
            <Image src={chatState.dreamData.image || DefaultDream} mode="aspectFill"></Image>
          </View>

          <View className={style['tags']}>
            {chatState.dreamData.tags?.map((item, index) => (
              <View className={style['tag']} key={index}>
                {item}
              </View>
            ))}
          </View>

          <View id="chat-area" className={style['chat-area']}>
            {chatState.messages.map((item, i) => (
              <View
                key={i}
                className={`${style['message']} ${style[`${item.sender}`]}`}
                id={`msg-${i}`}
              >
                <View className={style['message-content']}>
                  {item.chatting ? (
                    <View className={style['message-loading']}></View>
                  ) : (
                    <View
                      className="taro_html"
                      dangerouslySetInnerHTML={{ __html: item.message }}
                    />
                  )}
                </View>
              </View>
            ))}
            {/* {chatState.messages.length === 0 && (streamLoading || output) ? (
              <View className={`${style['message']} ${style['ai']}`}>
                <View className={style['message-content']}>
                  {streamLoading ? (
                    <View className={style['message-loading']}></View>
                  ) : output ? (
                    <View className="taro_html" dangerouslySetInnerHTML={{ __html: output }} />
                  ) : null}
                </View>
              </View>
            ) : null} */}
          </View>

          <View className={style['input-section']}>
            <Input
              className={style['input-box']}
              placeholder="说点什么..."
              value={inputMessage}
              adjust-position
              cursor-spacing="20"
              onInput={onMessageInput}
            />
            <Button
              className={`${style['save-btn']} ${isInputDisabled ? style['disabled'] : ''}`}
              disabled={isInputDisabled}
              onClick={handleSendMessage}
            >
              发送
            </Button>
          </View>
        </View>
      )}
      {loading && <Loading loadingText="梦境大师正在为您分析中..." />}
      {(!currentChatId || !chatState?.dreamData) && !loading && (
        <View className={style['empty-state']}>
          <Text>加载失败，请返回重试</Text>
        </View>
      )}
    </>
  );
};

export default Analysis;
