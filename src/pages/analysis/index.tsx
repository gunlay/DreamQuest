import Taro, { useDidHide } from "@tarojs/taro";
import { useEffect, useState } from "react";
import { View, Text, Image, Button, Input } from "@tarojs/components";
import DefaultDream from "@/assets/image/default_dream.png";
// import Empty from "@/assets/image/empty.png";
import { DreamData, DreamRecord, Message } from "./types";
import { generateTags, getInitialAnalysis } from "./help";
import style from "./index.module.scss";

const Analysis = () =>  {
  const [dreamData, setDreamData] = useState<DreamData | null>(null);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
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
  const addMessage = (type: 'ai' | 'user', content: string) => {
    setMessages((prev) => [...prev, { type, content }])
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
          }\n内容：${(dreamData && dreamData.content) || ""}`,
        });
      } else {
        // 添加之前的所有对话历史（最多保留最近的 10 轮对话）
        const recentMessages = messages.slice(-20); // 20条消息约等于10轮对话
        recentMessages.forEach((msg) => {
          apiMessages.push({
            role: msg.type === "user" ? "user" : "assistant",
            content: msg.content,
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
  const initAnalysis = async () => {
    console.log("分析页面开始加载");
    // 从本地存储获取用户刚刚输入的梦境数据
    const _dreamData = Taro.getStorageSync("currentDream");
    console.log("从本地存储获取的梦境数据:", _dreamData);

    if (!_dreamData) return;

    // 获取已有的梦境记录
    const existingDreams = Taro.getStorageSync("dreams") || [];
    const existingDream = existingDreams.find(
      (dream: DreamRecord) => dream.id === _dreamData.id
    );

    let tempDreamData: DreamData = existingDream
    let tempMessages: Message[] = existingDream?.messages || []

    if (existingDream) {
      console.log("找到已存在的记录:", existingDream);
      // 检查记录是否完整（是否有标签和解析）
      const hasTags = existingDream.tags && existingDream.tags.length > 0;
      const hasAnalysis =
        existingDream.analysis && existingDream.analysis.length > 0;

      if (!hasTags || !hasAnalysis) {
        console.log("记录不完整，需要生成标签和解析");
        // 显示加载状态
        Taro.showLoading({
          title: "正在分析梦境...",
          mask: true,
        });

        try {
          console.log("开始并行任务: AI分析、标签生成");
          // 并行执行两个任务：AI分析、标签生成
          const [analysisResult, tagsResult] = await Promise.all([
            getInitialAnalysis(existingDream),
            generateTags(existingDream),
          ]);

          // 更新数据
          tempDreamData.tags = tagsResult
          tempMessages = [{ type: "ai", content: analysisResult }]

          // 隐藏加载状态
          Taro.hideLoading();
        } catch (error) {
          console.error("分析失败，详细错误:", error);
          Taro.hideLoading();
          Taro.showToast({
            title: "分析失败",
            icon: "error",
          });
          tempDreamData.tags = ["神秘", "探索"]
          tempMessages = [
            { type: "ai", content: "抱歉，我现在有点累了，请稍后再试～" },
          ]
        }
      } else {
        console.log("记录完整，直接加载已有数据");
        // 如果记录完整，直接加载保存的分析和聊天记录
      }
      console.log("已加载现有记录的图片:", existingDream.image);

      // 清除 currentDream，因为已经加载了已存在的记录
      Taro.removeStorageSync("currentDream");
    } else {
      console.log("创建新记录，基础数据:", _dreamData);
      // 如果是新记录，设置基本信息并请求 AI 分析
      const weekday = ["日", "一", "二", "三", "四", "五", "六"][
        new Date(_dreamData.date.replace(/\./g, "-")).getDay()
      ];

      const initialDreamData = {
        id: _dreamData.id || Date.now(),
        title: _dreamData.title,
        content: _dreamData.content,
        date: _dreamData.date,
        weekday: `周${weekday}`,
        image: _dreamData.image || DefaultDream,
        tags: [], // 初始化为空数组
      };

      console.log("设置初始数据:", initialDreamData);
      console.log("使用的图片:", initialDreamData.image);

      tempDreamData = initialDreamData

      // 显示加载状态
      Taro.showLoading({
        title: "正在分析梦境...",
        mask: true,
      });

      try {
        console.log("开始并行任务: AI分析、标签生成");
        // 并行执行两个任务：AI分析、标签生成
        const [analysisResult, tagsResult] = await Promise.all([
          getInitialAnalysis(_dreamData),
          generateTags(_dreamData),
        ]);

        console.log("任务完成:", {
          analysisResult,
          tagsResult,
        });

        // 更新数据
        tempDreamData.tags = tagsResult

        // 添加 AI 回复
        tempMessages.push({type: 'ai', content: analysisResult})
        // 清除 currentDream，因为已经不需要了
        Taro.removeStorageSync("currentDream");

        // 隐藏加载状态
        Taro.hideLoading();
      } catch (error) {
        console.error("分析失败，详细错误:", error);
        Taro.hideLoading();
        Taro.showToast({
          title: "分析失败",
          icon: "error",
        });
        tempMessages.push({type: 'ai', content: '抱歉，我现在有点累了，请稍后再试～'})
        // 设置默认标签
        tempDreamData.tags = ["神秘", "探索"]
      }
    }
    console.log(tempDreamData);
    // Taro.setStorageSync("currentDream", tempDreamData)
    setDreamData(tempDreamData)
    setMessages(tempMessages)
    scrollToTop()
  }
  const pageViewOut = () => {
    if (!dreamData || !dreamData.id) return

    // 获取已有的梦境记录
    const existingDreams = Taro.getStorageSync('dreams') || []
    
    // 检查记录是否已存在
    const index = existingDreams.findIndex((dream: DreamRecord) => dream.id === dreamData.id)
    
    // 获取 AI 的初始分析（第一条 AI 消息）
    const firstAiMessage = messages.find(msg => msg.type === 'ai')
    const aiAnalysis = firstAiMessage ? firstAiMessage.content : ''
    
    const newDream: DreamRecord = {
      id: dreamData.id,
      title: dreamData.title,
      content: dreamData.content,
      date: dreamData.date,
      weekday: dreamData.weekday || '周一',
      image: dreamData.image || '/assets/images/default_dream.png',
      tags: dreamData.tags || ['神秘', '探索'],
      analysis: aiAnalysis,
      messages: messages
    }

    if (index === -1) {
      // 如果记录不存在，添加到开头
      existingDreams.unshift(newDream)
    } else {
      // 如果记录已存在，更新它
      existingDreams[index] = newDream
    }
    console.log('unload', existingDreams);
    
    // 保存更新后的记录
    Taro.setStorageSync('dreams', existingDreams)
  }

  useEffect(() => {
    initAnalysis()
    return () => {
      pageViewOut()
    }
  }, []);

  useDidHide(() => {
    pageViewOut()
  })

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
              {dreamData.date} {dreamData.weekday}
            </Text>
          </View>

          <View className={style["dream-content-wrapper"]}>
            <View className={style["dream-content"]}>{dreamData.content}</View>
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
                className={`${style["message"]} ${style[`${item.type}`]}`}
                id={`msg-${i}`}
              >
                <View className={style["message-content"]}>
                  <View 
                    className="taro_html" 
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
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