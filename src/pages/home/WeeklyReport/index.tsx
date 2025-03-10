import classNames from "classnames";
import { Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useLoginStore } from "@/store/loginStore";
import {
  generateWeeklyReportContent,
  getWeeklyDreams,
  homeApi,
} from "@/api/home";
import { useEffect, useState } from "react";
import { WeeklyReportParams } from "../types";
import style from "./index.module.scss";

const defaultWeeklyReport: WeeklyReportParams = {
  keywords: "开始记录你的第一个梦境吧",
  analysis:
    "开始记录梦境是了解自己内心世界的第一步。每个梦境都是独特的，都值得被记录和理解。",
  emotionTrend: "开始记录梦境，探索内心情感的变化。",
  aiSuggestion:
    "建议在睡醒后第一时间记录梦境，这样能记住更多细节。可以从印象最深刻的片段开始写起，慢慢培养记录习惯。",
};

const WeeklyReport = () => {
  const { isLogin } = useLoginStore()
  const [isReportExpanded, setIsReportExpanded] = useState<boolean>(false);
  const [weekInfo, setWeekInfo] = useState<{
    generating: boolean;
    weeklyReport: WeeklyReportParams;
  }>({
    generating: false,
    weeklyReport: defaultWeeklyReport,
  });

  const fetchWeeklyReport = async () => {
    setWeekInfo((prev) => ({ ...prev, generating: true }));

    try {
      const weeklyDreams = getWeeklyDreams();
      const _weeklyDreams = await homeApi.fetchWeeklyReport();
      console.log("_weeklyDreams", _weeklyDreams);

      if (weeklyDreams.length === 0) {
        setWeekInfo((prev) => ({
          ...prev,
          weeklyReport: defaultWeeklyReport,
          generating: false,
        }));
        return;
      }

      const reportContent = await generateWeeklyReportContent(weeklyDreams);
      setWeekInfo((prev) => ({
        ...prev,
        weeklyReport: reportContent,
        generating: false,
      }));
    } catch (error) {
      console.error("获取周报失败:", error);
      setWeekInfo((prev) => ({
        ...prev,
        generating: false,
        weeklyReport: defaultWeeklyReport,
      }));
      Taro.showToast({
        title: "周报生成失败",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    if (!isLogin) return
    fetchWeeklyReport();
  }, []);
  return (
    <View
      className={classNames(
        style["weekly-report"],
        isReportExpanded ? style.expanded : ""
      )}
      onClick={() => setIsReportExpanded((prev) => !prev)}
    >
      <View className={style["card-title"]}>
        <Text>🗒️ 梦境周报</Text>
      </View>

      {weekInfo.generating ? (
        <View className={style["loading-wrapper"]}>
          <View className={style["loading-spinner"]} />
          <Text className={style["loading-text"]}>正在生成周报...</Text>
        </View>
      ) : (
        <View
          className={classNames(
            style["report-content"],
            isReportExpanded ? style.expanded : ""
          )}
        >
          <View className={style["report-section"]}>
            <Text className={style["section-title"]}>📊 关键词</Text>
            <Text className={style["section-content"]}>
              {weekInfo.weeklyReport.keywords}
            </Text>
          </View>

          {/* <!-- 梦境解析 --> */}
          <View className={style["report-section"]}>
            <Text className={style["section-title"]}>💭 梦境解析</Text>
            <Text className={style["section-content"]}>
              {weekInfo.weeklyReport.analysis}
            </Text>
          </View>

          {/* <!-- 情绪趋势 --> */}
          <View className={style["report-section"]}>
            <Text className={style["section-title"]}>📈 情绪趋势</Text>
            <Text className={style["section-content"]}>
              {weekInfo.weeklyReport.emotionTrend}
            </Text>
          </View>

          {/* <!-- AI建议 --> */}
          <View className={style["report-section"]}>
            <Text className={style["section-title"]}>🤖 AI建议</Text>
            <Text className={style["section-content"]}>
              {weekInfo.weeklyReport.aiSuggestion}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default WeeklyReport;
