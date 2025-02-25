import { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { chatApi } from "@/api/chat";
import { ChatStatiticDTO } from "@/api/types/chat";
import MainBg from "@/assets/image/main/main_bg.png";
import Vip from "@/assets/icon/vip.png";
import { CloudFunctionResult, Dream, Message } from "./types";
import style from "./index.module.scss";

export default function Profile() {
  const [messageInfo, setMessageInfo] = useState<{
    lastId: string;
    messages: Message[];
  }>({
    lastId: "",
    messages: [],
  });
  const [statistic, setStatistic] = useState<ChatStatiticDTO>({
    moreDate: '周三',
    num: 500
  })
  const loadDreamsAndAnalyze = async () => {
    const data = await chatApi.fetchChatStatistics()
    setStatistic(data)
    try {
      // 1. 获取最近20条梦境记录
      const dreamsResult = (await Taro.cloud.callFunction({
        name: "getDreams",
        data: { limit: 20 },
      })) as CloudFunctionResult<{ data: Dream[] }>;

      if (!dreamsResult.result?.data) {
        throw new Error("获取梦境记录失败");
      }

      const dreams = dreamsResult.result.data;

      // 3. 如果有梦境记录，调用大模型进行分析
      if (dreams.length > 0) {
        const dreamTexts = dreams.map((dream) => dream.content).join("\n");

        // 调用大模型API
        const analysisResult = (await Taro.cloud.callFunction({
          name: "analyzeDreams",
          data: { dreams: dreamTexts },
        })) as CloudFunctionResult<{ content: string }>;

        if (!analysisResult.result?.content) {
          throw new Error("分析结果格式错误");
        }

        // 4. 显示分析结果
        const aiMessage: Message = {
          id: `msg_${Date.now()}`,
          type: "ai",
          content: analysisResult.result.content,
        };

        setMessageInfo({
          messages: [aiMessage],
          lastId: aiMessage.id || "",
        });
      } else {
        // 没有梦境记录时显示提示信息
        const aiMessage: Message = {
          id: `msg_${Date.now()}`,
          type: "ai",
          content: "你还没有记录任何梦境哦，快去记录一下吧！",
        };

        setMessageInfo({
          messages: [aiMessage],
          lastId: aiMessage.id || "",
        });
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      Taro.showToast({
        title: error instanceof Error ? error.message : "分析失败，请稍后重试",
        icon: "none",
      });
    }
  };

  useEffect(() => {
    loadDreamsAndAnalyze();
  }, []);
  return (
    <View className={style["container"]}>
      <Image
        className={style["bg-image"]}
        src={MainBg}
        mode="aspectFill"
      ></Image>

      <View className={style["fixed-content"]}>
        <View className={style["analysis-section"]}>
          <Text className={style["title"]}>综合解析</Text>
          <Text className={style["subtitle"]}>
            大模型基于你记录的所有梦境，解析你内心深处的焦虑、目标，综合回答你的问题～
          </Text>

          <View className={style["stats-board"]}>
            <View className={style["stat-item"]}>
              <Text className={style["stat-num"]}>{statistic.num}</Text>
              <Text className={style["stat-label"]}>梦境数量</Text>
            </View>
            <View className={style["stat-item"]}>
              <Text className={style["stat-num"]}>{statistic.moreDate}</Text>
              <Text className={style["stat-label"]}>最常做梦时间</Text>
            </View>
          </View>
        </View>

        <View className={style["vip-card"]}>
          <View className={style["vip-info"]}>
            <View className={style["vip-title"]}>
              <Image
                className={style["vip-icon"]}
                src={Vip}
                mode="aspectFit"
              ></Image>
              <Text className={style["vip-txt"]}>尊享 VIP 做梦卡</Text>
            </View>
            <Text className={style["vip-subtitle"]}>
              开通VIP，扩充大模型的梦境记忆数量
            </Text>
          </View>
          <Button className={style["vip-button"]}>敬请期待</Button>
        </View>
      </View>

      <View className={style["chat-container"]}>
        <ScrollView
          className={style["chat-area"]}
          enhanced
          scroll-y
          scroll-into-view={messageInfo.lastId}
          scroll-with-animation
          show-scrollbar={false}
        >
          {messageInfo.messages.map((item) => (
            <View
              key={item.id}
              className={`${style.message} ${
                item.type === "ai" ? style.ai : "user"
              }`}
              id={item.id}
            >
              <Text className={style["message-content"]}>{item.content}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
