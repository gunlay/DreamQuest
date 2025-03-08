import { View, Text, Image, Input } from "@tarojs/components";
import { useEffect, useState } from "react";
import { useDidShow } from "@tarojs/taro";
import SendIcon from "@/assets/icon/send.png";
import MainBg from "@/assets/image/main/main_bg.png";
import RecodSelected from "@/assets/image/tabbar/record_selected.png";
import PageContainer from "@/Components/PageContainer";
import classNames from "classnames";
import { useSystemStore } from "@/store/systemStore";
import { homeApi } from "@/api/home";
import DreamInput from "./DreamInput/index";
// import DreamAnalysis from './DreamAnalysis/index';
import TodayFortune from "./TodayFortune";
import WeeklyReport from "./WeeklyReport";

import style from "./index.module.scss";

const Home: React.FC = () => {
  const { appBarHeight } = useSystemStore();
  const [homeInfo, setHomeInfo] = useState<{
    content: string;
    date: string;
    title: string;
    week: string;
  }>({
    content: "",
    date: "",
    title: "",
    week: "",
  });

  const [showDreamInput, setShowDreamInput] = useState<boolean>(false);

  // const updateDateInfo = () => {
  //   const now = new Date();
  //   const year = now.getFullYear();
  //   const month = String(now.getMonth() + 1).padStart(2, "0");
  //   const day = String(now.getDate()).padStart(2, "0");
  //   const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  //   setDateInfo({
  //     date: `${year}.${month}.${day}`,
  //     weekday: `周${weekdays[now.getDay()]}`,
  //   });
  // };
  useDidShow(() => {
    homeApi.fetchHomeInfo().then((res) => {
      setHomeInfo(res);
    });
  });

  // useEffect(() => {
  //   homeApi.fetchHomeInfo().then((res) => {
  //     setHomeInfo(res);
  //   });
  // }, []);

  return (
    <PageContainer
      appbar={{
        type: "immersive",
      }}
    >
      <View
        className={classNames(style["container"], "safe-area-inset-bottom")}
        style={{ paddingTop: `${appBarHeight}px` }}
      >
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
            <Text className={style["date"]}>{homeInfo.date}</Text>
            <Text className={style["weekday"]}>{homeInfo.week}</Text>
          </View>
        </View>

        {/* Dream Theory */}
        <View className={style["dream-theory"]}>
          <View className={style["theory-title"]}>
            <Text>✨</Text>
            <Text className={style["theory-txt"]}>{homeInfo.title}</Text>
          </View>
          <Text className={style["theory-content"]}>{homeInfo.content}</Text>
        </View>

        {/* Fortune Card */}
        <TodayFortune />

        {/* Weekly Report */}
        <WeeklyReport />

        {/* Input Section */}
        <View
          className={classNames(
            style["input-section"],
            "safe-area-inset-bottom"
          )}
        >
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
            </View>
            <View className={style["send-icon"]}>
              <Image src={SendIcon} mode="aspectFit" className={style.icon} />
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
    </PageContainer>
  );
};

export default Home;
