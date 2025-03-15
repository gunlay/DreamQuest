import { useState } from "react";
import { generateWeeklyReportContent, WeeklyReportParams } from "@/hooks/useWeeklyReportHooks";
import classNames from "classnames";
import { Text, View } from "@tarojs/components";
import { useDidShow } from "@tarojs/taro";
import { useLoginStore } from "@/store/loginStore";
import { homeApi } from "@/api/home";
import style from "./index.module.scss";

const WeeklyReport = () => {
  const { isLogin } = useLoginStore()
  const [isReportExpanded, setIsReportExpanded] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReportParams | null>(null);

  const fetchWeeklyReport = async () => {
    setGenerating(true)

    try {
      const data = await homeApi.fetchWeekMessage()
      console.log('data', data);
      setWeeklyReport(generateWeeklyReportContent(data))
      const report = await homeApi.fetchWeeklyReport()
    } catch (error) {
      console.error("获取周报失败:", error)
    }
    setGenerating(false)
  };

  useDidShow(() => {
    if (!isLogin) return
    fetchWeeklyReport();
  });
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

      {generating ? (
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
              {weeklyReport?.keywords}
            </Text>
          </View>

          {/* <!-- 情绪趋势 --> */}
          <View className={style["report-section"]}>
            <Text className={style["section-title"]}>📈 情绪趋势</Text>
            <Text className={style["section-content"]}>
              {weeklyReport?.emotionTrend}
            </Text>
          </View>

          {/* <!-- 梦境解析 --> */}
          <View className={style["report-section"]}>
            <Text className={style["section-title"]}>💭 梦境解析</Text>
            <Text className={style["section-content"]}>
              {weeklyReport?.analysis}
            </Text>
          </View>

          {/* <!-- AI建议 --> */}
          <View className={style["report-section"]}>
            <Text className={style["section-title"]}>🤖 AI建议</Text>
            <Text className={style["section-content"]}>
              {weeklyReport?.aiSuggestion}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default WeeklyReport;
