import { View, Text, Image, Input } from "@tarojs/components";
import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import Vocie from "@/assets/icon/voice.png";
import MainBg from "@/assets/image/main/main_bg.png";
import RecodSelected from "@/assets/image/tabbar/record_selected.png";
import { DreamData, DateInfo } from "./types";
import DreamInput from "./DreamInput/index";
// import DreamAnalysis from './DreamAnalysis/index';
import TodayFortune from "./TodayFortune";
import WeeklyReport from "./WeeklyReport";

import style from "./index.module.scss";

const Home: React.FC = () => {
  const [dateInfo, setDateInfo] = useState<DateInfo>({
    date: "",
    weekday: "",
  });

  const [showDreamInput, setShowDreamInput] = useState<boolean>(false);

  const updateDateInfo = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    setDateInfo({
      date: `${year}.${month}.${day}`,
      weekday: `周${weekdays[now.getDay()]}`,
    });
  };

  const handleDreamSave = (dreamData: DreamData) => {
    const existingDreams = Taro.getStorageSync("dreams") || [];
    const updatedDreams = [dreamData, ...existingDreams];
    Taro.setStorageSync("dreams", updatedDreams);

    setShowDreamInput(false);
    // fetchWeeklyReport();

    Taro.navigateTo({
      url: "/pages/analysis/index",
    });
  };

  useEffect(() => {
    updateDateInfo();
    // fetchDreamTheory();
    // fetchWeeklyReport();
  }, []);

  return (
    <View className={style["container"]}>
      <Image className={style["bg-image"]} src={MainBg} mode="aspectFill" />

      {/* Header */}
      <View className={style["header"]}>
        <View className={style["logo-wrapper"]}>
          <Image
            className={style["logo"]}
            src={RecodSelected}
            mode="aspectFit"
          />
          <Text className={style["app-name"]}>梦寻</Text>
        </View>
        <View className={style["date-wrapper"]}>
          <Text className={style["date"]}>{dateInfo.date}</Text>
          <Text className={style["weekday"]}>{dateInfo.weekday}</Text>
        </View>
      </View>

      {/* Dream Theory */}
      <View className={style["dream-theory"]}>
        <View className={style["theory-title"]}>
          <Text>✨</Text>
          <Text className={style["theory-txt"]}>弗洛伊德的梦境理论</Text>
        </View>
        <Text className={style["theory-content"]}>
          弗洛伊德认为，梦境是潜意识欲望和冲突的表现，尤其是那些被压抑的欲望。昨晚的梦，是不是某种未实现的渴望？
        </Text>
      </View>

      {/* Fortune Card */}
      <TodayFortune />

      {/* Weekly Report */}
      <WeeklyReport />

      {/* Input Section */}
      <View className={style["input-section"]}>
        <View className={style["chat-bubble"]}>
          昨晚梦到什么了嘛?记录一下吧 🤗
        </View>
        <View className={style["input-area"]}>
          <View
            className={style["dream-input"]}
            onClick={() => setShowDreamInput(true)}
          >
            <Input
              placeholder="write your dream"
              placeholderStyle="color: rgba(60, 60, 67, 0.6)"
              disabled
            />
            <Image
              className={style["voice-icon"]}
              src={Vocie}
              mode="aspectFit"
            />
          </View>
        </View>
      </View>

      {/* Dream Input Component */}
      <DreamInput
        show={showDreamInput}
        onClose={() => setShowDreamInput(false)}
      />
      {/* 添加梦境分析浮层 */}
      {/* <DreamAnalysis
        visible={state.showDreamAnalysis}
        dreamData={currentDream}
        onClose={onDreamAnalysisClose}
      /> */}
    </View>
  );
};

export default Home;
