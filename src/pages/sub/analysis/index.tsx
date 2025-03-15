import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import { View, Text, Image, Button, Input } from "@tarojs/components";
import { chatApi } from "@/api/chat";
import { ChatHistoryDTO, MessageDTO } from "@/api/types/chat";
// import Empty from "@/assets/image/empty.png";
import { generateTags, getInitialAnalysis } from "./help";
import style from "./index.module.scss";


const Analysis = () =>  {
  const chatId = Taro.getCurrentInstance()?.router?.params.chatId as string;
  const DefaultDream = ''
  const [dreamData, setDreamData] = useState<ChatHistoryDTO | null>(null);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageDTO[]>([]);
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
  const addMessage = (sender: 'ai' | 'user', message: string) => {
    setMessages((prev) => [...prev, { sender, message }])
    // 添加延时确保消息渲染完成后再滚动
    scrollToTop()
  }

  const sendMessage = async () => {
    if (!inputMessage || !inputMessage.trim()) return;

    // 添加用户消息
    addMessage("user", inputMessage.trim());

    // 清空输入框
    setInputMessage("");

    try {
      // 显示加载状态
      Taro.showLoading({
        title: "思考中...",
        mask: true,
      });

      // 构建完整的对话历史
      const apiMessages = [
        {
          role: "system",
          content:
            messages.length === 0
              ? "你是一个专业的梦境分析师，请严格按照以下格式分析用户的梦境。使用温和、专业、富有洞察力的语气，并确保段落结构清晰。请使用HTML标签来格式化输出：\n\n<h3>🌟 梦境主题</h3>\n<p><strong>✨ 核心主题：</strong><br/>用简短的一句话总结梦境的核心主题</p>\n<p><strong>🔑 关键元素：</strong></p>\n<ul>\n<li>元素一</li>\n<li>元素二</li>\n<li>元素三</li>\n</ul>\n\n<h3>🔍 心理学解析</h3>\n<p><strong>🧠 弗洛伊德视角：</strong><br/>从潜意识和原欲望的角度分析</p>\n<p><strong>🌌 荣格视角：</strong><br/>从原型理论和集体无意识的角度解读</p>\n<p><strong>🔬 现代心理学：</strong><br/>结合当代心理学理论的见解</p>\n\n<h3>💭 潜意识解读</h3>\n<p><strong>💫 心理需求：</strong></p>\n<ul>\n<li>需求点一</li>\n<li>需求点二</li>\n</ul>\n<p><strong>🌊 情绪状态：</strong></p>\n<ul>\n<li>情绪点一</li>\n<li>情绪点二</li>\n</ul>\n\n<h3>💡 启发建议</h3>\n<p><strong>🎯 具体建议：</strong></p>\n<ol>\n<li>第一条建议</li>\n<li>第二条建议</li>\n<li>第三条建议</li>\n</ol>\n<p><strong>🔮 反思方向：</strong></p>\n<ul>\n<li>反思点一</li>\n<li>反思点二</li>\n</ul>"
              : "你是一个温和、专业的梦境分析师，正在与用户进行自然的对话。请注意：\n\n1. 使用HTML标签让回复更易读：\n- 使用<p>标签分段\n- 重要内容用<strong>加粗</strong>\n- 如果需要列点，使用<ul>或<ol>\n\n2. 为了让对话更生动：\n- 在重要段落开头使用合适的emoji\n- 用温和友好的语气交流\n- 适时表达共情和理解\n\n3. 回答要点：\n- 保持专业性，但语气要自然流畅\n- 根据问题的具体内容灵活组织回复\n- 适时引用之前的分析，保持连贯性\n- 如果用户问题简单，就简短回答\n- 如果问题复杂，可以分点详细解释\n\n示例：\n<p>🌟 [你的观点]</p>\n<p>✨ [补充解释，如果需要的话]</p>\n\n或者列点说明：\n<ul>\n<li>🔍 [观点1]</li>\n<li>💫 [观点2]</li>\n</ul>",
        },
      ];

      // 如果是第一次对话，添加梦境内容
      if (messages.length === 0) {
        apiMessages.push({
          role: "user",
          content: `请分析这个梦境。\n标题：${
            (dreamData && dreamData.title) || ""
          }\n内容：${(dreamData && dreamData.desc) || ""}`,
        });
      } else {
        // 添加之前的所有对话历史（最多保留最近的 10 轮对话）
        const recentMessages = messages.slice(-20); // 20条消息约等于10轮对话
        recentMessages.forEach((msg) => {
          apiMessages.push({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.message,
          });
        });
      }

      // 添加当前用户的新消息
      if (messages.length > 0) {
        apiMessages.push({
          role: "user",
          content: inputMessage.trim(),
        });
      }

      const result = (await new Promise((resolve, reject) => {
        Taro.request({
          url: "https://api.deepseek.com/v1/chat/completions",
          method: "POST",
          header: {
            "Content-Type": "application/json",
            Authorization: "Bearer sk-276d5267971644bca803a9130d6db1ac",
          },
          data: {
            model: "deepseek-chat",
            messages: apiMessages,
            temperature: 0.7,
            stream: false,
          },
          success: resolve,
          fail: reject,
        });
      })) as any

      const response = result.data as any;

      // 隐藏加载状态
      Taro.hideLoading();

      if (
        response &&
        response.choices &&
        response.choices[0] &&
        response.choices[0].message &&
        response.choices[0].message.content
      ) {
        // 添加 AI 回复
        addMessage("ai", response.choices[0].message.content);
      } else {
        throw new Error("AI 回复格式错误");
      }
    } catch (error) {
      console.error("获取 AI 回复失败:", error);
      Taro.hideLoading();
      Taro.showToast({
        title: "获取回复失败",
        icon: "error",
      });

      // 添加一个友好的错误提示作为 AI 消息
      addMessage("ai", "抱歉，我现在有点累了，请稍后再试～");
    }
  };
  const init = async () => {
    console.log('chatId', chatId);
    
    const result = await chatApi.fetchChatHistory({chatId})
    console.log(result);
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
                  <View 
                    className="taro_html" 
                    dangerouslySetInnerHTML={{ __html: item.message }}
                  />
                  {/* <Markdown content={item.message}></Markdown> */}
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