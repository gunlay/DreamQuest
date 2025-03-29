import { View, Text, Image, Button, Input, ITouchEvent } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Loading from '@/Components/Loading';
import { useStreamOutput } from '@/hooks/useStreamOutput';
import { useChatStore } from '@/store/chatStore';
import style from './index.module.scss';

let timeoutId: NodeJS.Timeout | null = null;

const Timeout = 500;

const Analysis = () => {
  const DefaultDream = '';
  const chatAreaRef = useRef<typeof View>(null);
  const { activeRequests, initChat, getChatState, sendMessage, clearChat, setChatState } =
    useChatStore();
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const chatState = getChatState(currentChatId || '');

  // 滚动到底部功能
  const scrollToTop = useCallback(
    (() => {
      let lastScrollHeight = 0;
      return () => {
        Taro.nextTick(() => {
          const query = Taro.createSelectorQuery();
          query
            .select('#chat-area')
            .boundingClientRect()
            .exec((res) => {
              console.log('res', res[0].height, lastScrollHeight);
              // 如果res[0].height与当前height不一致，则滚动
              if (res && res[0] && res[0].height !== lastScrollHeight) {
                lastScrollHeight = res[0].height;
                Taro.pageScrollTo({
                  scrollTop: res[0].height,
                  duration: 600,
                });
              }
            });
        });
      };
    })(),
    []
  );

  const stream = useStreamOutput({
    getChatState,
    setChatState,
    setMessage: () => {
      timeoutId = setTimeout(scrollToTop, Timeout);
    },
  });
  const sse = {
    ...stream,
    onComplete: () => {
      stream.onComplete?.();
      clearTimeout(timeoutId as NodeJS.Timeout);
      timeoutId = null;
    },
  };
  const chatId = Taro.getCurrentInstance()?.router?.params?.chatId as string;

  const isInputDisabled = useMemo(() => {
    if (!currentChatId) return true;
    return (
      !inputMessage.trim() ||
      activeRequests > 0 ||
      stream.loading ||
      chatState?.messages.some((msg) => msg.chatting)
    );
  }, [currentChatId, inputMessage, activeRequests, chatState, stream.loading]);

  const onMessageInput = (e: ITouchEvent) => {
    setInputMessage(e.detail.value);
  };

  // 确保内容更新后滚动并清理
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // 组件卸载时清理
  // useEffect(() => {
  //   return () => {
  //     if (currentChatId) {
  //       clearChat(currentChatId);
  //     }
  //   };
  // }, [currentChatId, clearChat]);

  const handleSendMessage = async () => {
    if (!inputMessage || !inputMessage.trim() || !currentChatId) return;
    const message = inputMessage.trim();
    setInputMessage('');
    scrollToTop();
    try {
      await sendMessage({
        chatId: currentChatId,
        message,
        sse,
      });
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
        ...sse,
        onChunkReceived: (chunk) => {
          const r = stream.onChunkReceived(chunk);
          setLoading(false);
          return r;
        },
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
    scrollToTop();
  };

  useEffect(() => {
    init();
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

          {chatState.dreamData.imageAndTagsLoaded ? (
            <>
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
            </>
          ) : (
            <Loading loadingText="" />
          )}

          <View id="chat-area" ref={chatAreaRef} className={style['chat-area']}>
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
