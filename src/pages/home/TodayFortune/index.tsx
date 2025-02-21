import { FC, useEffect, useState } from "react";
import classNames from "classnames";
import Taro from "@tarojs/taro";
import { Picker, Text, View } from "@tarojs/components";
import { Fortune } from "../types";
import style from "./index.module.scss";

const zodiacs = [
  "白羊座",
  "金牛座",
  "双子座",
  "巨蟹座",
  "狮子座",
  "处女座",
  "天秤座",
  "天蝎座",
  "射手座",
  "摩羯座",
  "水瓶座",
  "双鱼座",
];

const TodayFortune = () => {
  const [fortune, setFortune] = useState<Fortune>({
    overall: "",
    career: "",
    love: "",
    money: "",
    health: "",
    luckyNumber: "",
    luckyColor: "",
    luckyDirection: "",
  });
  const [zodiacIndex, setodiacIndex] = useState<number>(-1);
  const [hasSelectedZodiac, setHasSelectedZodiac] = useState<boolean>(false);
  const [isFortuneExpanded, setIsFortuneExpanded] = useState<boolean>(false);

  const toggleFortune = () => {
    if (!hasSelectedZodiac) return;
    setIsFortuneExpanded((prev) => !prev);
  };
  const fetchFortune = async (zodiac: string) => {
    const zodiacMap: { [key: string]: string } = {
      白羊座: "aries",
      金牛座: "taurus",
      双子座: "gemini",
      巨蟹座: "cancer",
      狮子座: "leo",
      处女座: "virgo",
      天秤座: "libra",
      天蝎座: "scorpio",
      射手座: "sagittarius",
      摩羯座: "capricorn",
      水瓶座: "aquarius",
      双鱼座: "pisces",
    };

    try {
      const zodiacEn = zodiacMap[zodiac];
      if (!zodiacEn) throw new Error("无效的星座选择");

      const result = await Taro.request({
        url: "https://api.vvhan.com/api/horoscope",
        method: "GET",
        data: {
          type: zodiacEn,
          time: "today",
        },
      });

      const { data } = result;
      if (data?.success) {
        Taro.setStorageSync("userZodiac", zodiac);
        setFortune((prev) => ({
          ...prev,
          overall: data.data.fortunetext.all || "",
          career: data.data.fortunetext.work || "",
          love: data.data.fortunetext.love || "",
          money: data.data.fortunetext.money || "",
          health: data.data.fortunetext.health || "",
          luckyNumber: data.data.luckynumber || "",
          luckyColor: data.data.luckycolor || "",
          luckyDirection: data.data.luckyconstellation || "",
        }));
        setHasSelectedZodiac(true);
      }
    } catch (error) {
      console.error("获取运势失败:", error);
      Taro.showToast({
        title: "获取运势失败",
        icon: "error",
      });
    }
  };

  const handleZodiacChange = (e: any) => {
    const index = parseInt(e.detail.value);
    setodiacIndex(index);
    setHasSelectedZodiac(true);
    setIsFortuneExpanded(true);
    fetchFortune(zodiacs[index]);
  };

  useEffect(() => {
    const savedZodiac = Taro.getStorageSync("userZodiac");
    if (savedZodiac) {
      const _zodiacIndex = zodiacs.findIndex((z) => z === savedZodiac);
      setodiacIndex(_zodiacIndex);
      setHasSelectedZodiac(true);
      fetchFortune(savedZodiac);
    }
  }, []);
  return (
    <View className={style["fortune-card"]} onClick={toggleFortune}>
      <View className={style["card-title"]}>
        <Text>📅 今日运势</Text>
      </View>

      {!hasSelectedZodiac ? (
        <View className={style["zodiac-selector"]}>
          <Picker
            onChange={handleZodiacChange}
            value={zodiacIndex}
            range={zodiacs}
          >
            <View className={style["picker-content"]}>
              <Text>
                {zodiacIndex > -1 ? zodiacs[zodiacIndex] : "选择星座"}
              </Text>
              <Text className={style["arrow"]}>▼</Text>
            </View>
          </Picker>
        </View>
      ) : (
        <View
          className={classNames(
            style["fortune-content"],
            isFortuneExpanded ? style.expanded : ""
          )}
        >
          <View className={style["fortune-item"]}>
            <Text className={style["item-title"]}>✨ 整体运势：</Text>
            <Text className={style["item-content"]}>{fortune.overall}</Text>
          </View>
          <View className={style["fortune-item"]}>
            <Text className={style["item-title"]}>✨ 整体运势：</Text>
            <Text className={style["item-content"]}>{fortune.overall}</Text>
          </View>
          <View className={style["fortune-item"]}>
            <Text className={style["item-title"]}>💼 事业运势：</Text>
            <Text className={style["item-content"]}>{fortune.career}</Text>
          </View>
          <View className={style["fortune-item"]}>
            <Text className={style["item-title"]}>💕 爱情运势：</Text>
            <Text className={style["item-content"]}>{fortune.love}</Text>
          </View>
          <View className={style["fortune-item"]}>
            <Text className={style["item-title"]}>💰 财富运势：</Text>
            <Text className={style["item-content"]}>{fortune.money}</Text>
          </View>
          <View className={style["fortune-item"]}>
            <Text className={style["item-title"]}>🏃 健康运势：</Text>
            <Text className={style["item-content"]}>{fortune.health}</Text>
          </View>
          <View className={style["fortune-numbers"]}>
            <Text>🔢 幸运数字：{fortune.luckyNumber}</Text>
            <Text>🎨 幸运色：{fortune.luckyColor}</Text>
            <Text>🧭 幸运星座：{fortune.luckyDirection}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default TodayFortune;
