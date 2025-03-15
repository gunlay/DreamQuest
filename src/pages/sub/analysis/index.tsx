import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import { View, Text, Image, Button, Input } from "@tarojs/components";
import { chatApi } from "@/api/chat";
import { ChatHistoryDTO, MessageDTO, NewMessageDTO } from "@/api/types/chat";
// import Empty from "@/assets/image/empty.png";
import style from "./index.module.scss";


const Analysis = () =>  {
  const chatId = Taro.getCurrentInstance()?.router?.params.chatId as string;
  const dreamInput = JSON.parse(Taro.getCurrentInstance()?.router?.params.chatId as string) as NewMessageDTO;
  const DefaultDream = ''
  const [chatting, setChatting] = useState<boolean>(false);
  const [dreamData, setDreamData] = useState<ChatHistoryDTO | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  // 获取当前路由的参数
  const onMessageInput = (e: any) => {
    setInputMessage(e.detail.value);
  };

  const scrollToTop = () => {
    // 添加延时确保消息渲染完成后再滚动
    Taro.nextTick(() => {
      Taro.pageScrollTo({
        scrollTop: 9999,
        duration: 300
      })
    })
  }
  const addMessage = (sender: 'ai' | 'user', message: string, _chatting = false) => {
    setMessages((prev) => {
      if (prev[prev.length - 1].chatting) {
        prev[prev.length - 1].chatting = false;
        prev[prev.length - 1].message = message;
        return prev
      }
      return [
        ...prev, 
        { sender, message, chatting: _chatting }
      ]
    })
    // 添加延时确保消息渲染完成后再滚动
    scrollToTop()
  }

  const sendMessage = async () => {
    if (!inputMessage || !inputMessage.trim()) return;
    // 清空输入框
    setInputMessage("");
    setChatting(true)
    // 添加用户消息
    addMessage("user", inputMessage.trim());
    addMessage("ai", '', true);
    try {
      const data = await chatApi.sendMessages({ chatId, message: inputMessage.trim(), sender: 'user' });
      // 添加 AI 回复
      addMessage("ai", data);
    } catch {}
    setChatting(false)
  };
  const init = async () => {
    let _chatId = chatId
    if (!chatId && dreamInput) {
      const { chatId: newId } = await chatApi.createNewChat(dreamInput)
      _chatId = newId
    }
    const result = await chatApi.fetchChatHistory({ chatId: _chatId })
    setDreamData(result)
    setMessages(result.messages)
    scrollToTop()
  }

  useEffect(() => {
    init()
  }, []);

  if (process.env.TARO_ENV !== 'h5') {
    require('@tarojs/taro/html.css')
  }

  return (
    <>
      {dreamData ? (
        <View className={style["container"]}>
          <View className={style["header"]}>
            <Text className={style["title"]}>{dreamData.title}</Text>
            <Text className={style["date"]}>
              {dreamData.date} {dreamData.week}
            </Text>
          </View>

          <View className={style["dream-content-wrapper"]}>
            <View className={style["dream-content"]}>{dreamData.desc}</View>
          </View>

          <View className={style["dream-image"]}>
            <Image
              src={dreamData.image || DefaultDream}
              mode="aspectFill"
            ></Image>
          </View>

          <View className={style["tags"]}>
            {dreamData.tags?.map((item, index) => (
              <View className={style["tag"]} key={index}>
                {item}
              </View>
            ))}
          </View>

          <View className={style["chat-area"]}>
            {messages.map((item, i) => (
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
              className={`${style["save-btn"]} ${
                !inputMessage ? style["disabled"] : ""
              }`}
              onClick={sendMessage}
            >
              发送
            </Button>
          </View>
        </View>
      ) : (
        <View className={style["empty-state"]}>
          {/* <Image src={Empty} mode="aspectFit"></Image> */}
          <Text>加载失败，请返回重试</Text>
        </View>
      )}
    </>
  );
}

export default Analysis