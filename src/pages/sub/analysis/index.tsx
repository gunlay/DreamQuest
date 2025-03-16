import Taro from "@tarojs/taro";
import { useEffect, useState, useMemo } from "react";
import { View, Text, Image, Button, Input } from "@tarojs/components";
import { useChatStore } from "@/store/chatStore";
import style from "./index.module.scss";

const Analysis = () => {
  const DefaultDream = ''
  const {
    activeRequests,
    initChat,
    getChatState,
    sendMessage,
    clearChat,

  } = useChatStore()
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [inputMessage, setInputMessage] = useState<string>("");

  const chatId = Taro.getCurrentInstance()?.router?.params?.chatId as string;
  const chatState = getChatState(currentChatId);
  
  const isInputDisabled = useMemo(() => {
    if (!currentChatId) return true;
    return !inputMessage.trim() || 
           activeRequests > 0 || 
           chatState?.messages.some(msg => msg.chatting);
  }, [currentChatId, inputMessage, activeRequests, chatState]);

  const onMessageInput = (e: any) => {
    setInputMessage(e.detail.value);
  };

  const scrollToTop = () => {
    Taro.nextTick(() => {
      const query = Taro.createSelectorQuery();
      query.select('.chat-area').boundingClientRect().exec((res) => {
        if (res && res[0]) {
          Taro.pageScrollTo({
            scrollTop: res[0].height,
            duration: 300
          })
        }
      })
    })
  }

  const handleSendMessage = async () => {
    if (!inputMessage || !inputMessage.trim() || !currentChatId) return;
    setInputMessage("");
    try {
      await sendMessage(currentChatId, inputMessage.trim());
      scrollToTop();
    } catch (error: any) {
      Taro.showToast({
        title: error.message || '发送失败',
        icon: 'none'
      });
    }
  };

  const init = async () => {
    try {
      const finalChatId = await initChat(chatId);
      setCurrentChatId(finalChatId);
      scrollToTop();
    } catch (error: any) {
      Taro.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    }
  }

  useEffect(() => {
    init();
    return () => {
      if (currentChatId) {
        clearChat(currentChatId);
      }
    };
  }, []);

  // useEffect(() => {
  //   if (chatState?.messages && chatState?.messages?.length > 0) {
  //     scrollToTop();
  //   }
  // }, [chatState?.messages]);

  if (process.env.TARO_ENV !== 'h5') {
    require('@tarojs/taro/html.css')
  }

  return (
    <>
      {currentChatId && chatState?.dreamData ? (
        <View className={style["container"]}>
          <View className={style["header"]}>
            <Text className={style["title"]}>{chatState.dreamData.title}</Text>
            <Text className={style["date"]}>
              {chatState.dreamData.date} {chatState.dreamData.week}
            </Text>
          </View>

          <View className={style["dream-content-wrapper"]}>
            <View className={style["dream-content"]}>{chatState.dreamData.desc}</View>
          </View>

          <View className={style["dream-image"]}>
            <Image
              src={chatState.dreamData.image || DefaultDream}
              mode="aspectFill"
            ></Image>
          </View>

          <View className={style["tags"]}>
            {chatState.dreamData.tags?.map((item, index) => (
              <View className={style["tag"]} key={index}>
                {item}
              </View>
            ))}
          </View>

          <View className={style["chat-area"]}>
            {chatState.messages.map((item, i) => (
              <View
                key={i}
                className={`${style["message"]} ${style[`${item.sender}`]}`}
                id={`msg-${i}`}
              >
                <View className={style["message-content"]}>
                  {
                    item.chatting ? <View className={style["message-loading"]}></View>: <View 
                      className="taro_html" 
                      dangerouslySetInnerHTML={{ __html: item.message }}
                    />
                  }
                </View>
              </View>
            ))}
          </View>

          <View className={style["input-section"]}>
            <Input
              className={style["input-box"]}
              placeholder="说点什么..."
              value={inputMessage}
              adjust-position
              cursor-spacing="20"
              onInput={onMessageInput}
            />
            <Button
              className={`${style["save-btn"]} ${isInputDisabled ? style["disabled"] : ""}`}
              disabled={isInputDisabled}
              onClick={handleSendMessage}
            >
              发送
            </Button>
          </View>
        </View>
      ) : (
        <View className={style["empty-state"]}>
          <Text>加载失败，请返回重试</Text>
        </View>
      )}
    </>
  );
}

export default Analysis