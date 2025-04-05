import { View, Text, Image, Button, Input, ITouchEvent } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState, useMemo, useCallback, useRef, FC } from 'react';
import { MessageDTO } from '@/api/types/chat';
import ShareBtn from '@/Components/Business/ShareBtn';
import Loading from '@/Components/Loading';
import { useStreamOutput } from '@/hooks/useStreamOutput';
import { useChatStore } from '@/store/chatStore';
import style from './index.module.scss';

export interface DreamContentProps {
  pageSet?: {
    input: boolean;
    share: boolean;
    chat: boolean;
  };
}

let timeoutId: NodeJS.Timeout | null = null;

const Timeout = 500;

const DreamContent: FC<DreamContentProps> = ({
  pageSet = { input: true, share: true, chat: true },
}) => {
  const chatId = (Taro.getCurrentInstance()?.router?.params?.chatId as string) || '';
  const newCreate = (Taro.getCurrentInstance()?.router?.params?.newCreate as string) || false;
  const DefaultDream =
    'https://aloss-qinghua-image.oss-cn-shanghai.aliyuncs.com/images/67ecd464b44e660001340f30.jpg';
  const chatAreaRef = useRef<typeof View>(null);
  const { initChat, getChatState, sendMessage, setChatState } = useChatStore();
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const chatState = getChatState(chatId);

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

  const isInputDisabled = useMemo(() => {
    if (!chatId) return true;
    return (
      !inputMessage.trim() ||
      // activeRequests > 0 ||
      stream.loading ||
      chatState?.messages.some((msg) => msg.chatting)
    );
  }, [chatId, inputMessage, chatState, stream.loading]);

  const onMessageInput = (e: ITouchEvent) => {
    setInputMessage(e.detail.value);
  };

  const handleShare = () => {
    console.log('handleShare');
  };

  // 确保内容更新后滚动并清理
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage || !inputMessage.trim() || !chatId) return;
    const message = inputMessage.trim();
    setInputMessage('');
    scrollToTop();
    try {
      await sendMessage({
        chatId,
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
      await initChat(chatId, !!newCreate, {
        ...sse,
        onChunkReceived: (chunk) => {
          const r = stream.onChunkReceived(chunk);
          setLoading(false);
          return r;
        },
      });
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

  const chatMessage = useMemo<MessageDTO[]>(() => {
    if (!chatState?.messages) return [];
    return pageSet.chat ? chatState?.messages : chatState?.messages.slice(0, 1);
  }, [chatState?.messages, pageSet.chat]);

  if (process.env.TARO_ENV !== 'h5') {
    require('@tarojs/taro/html.css');
  }

  return (
    <>
      {chatId && chatState?.dreamData && !loading && (
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
            {chatMessage.map((item, i) => (
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

          {pageSet.share ? (
            <Button className={style['operation-wrapper']} openType="share">
              <ShareBtn onShare={handleShare} />
            </Button>
          ) : null}

          {pageSet.input ? (
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
          ) : null}
        </View>
      )}
      {loading && <Loading loadingText="梦境大师正在为您分析中..." />}
      {(!chatId || !chatState?.dreamData) && !loading && (
        <View className={style['empty-state']}>
          <Text>加载失败，请返回重试</Text>
        </View>
      )}
    </>
  );
};

export default DreamContent;
