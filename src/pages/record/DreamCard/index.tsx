import { FC } from "react";
import Taro from "@tarojs/taro";
import { Image, Text, View } from "@tarojs/components";
import style from "./index.module.scss";
import { DreamRecord } from "../types";

const DreamCard: FC<{
  dream: DreamRecord;
}> = ({ dream }) => {
  const viewDreamDetail = (dreamId: number) => {
    const dreams = Taro.getStorageSync("dreams") || [];
    const dreamData = dreams.find((d: DreamRecord) => d.id === dreamId);

    if (dreamData) {
      Taro.setStorageSync("currentDream", dreamData);
      Taro.navigateTo({
        url: "/pages/analysis/index",
      });
    }
  };
  return (
    <View
      className={style["dream-card"]}
      key={dream.id}
      onClick={() => viewDreamDetail(dream.id)}
      data-id={dream.id}
    >
      <View className={style["card-header"]}>
        <Text className={style["card-title"]}>{dream.title}</Text>
        <Text className={style["card-date"]}>
          {dream.date} {dream.weekday}
        </Text>
      </View>

      <Image
        className={style["dream-image"]}
        src={dream.image}
        mode="aspectFill"
      ></Image>

      <Text className={style["dream-content"]}>{dream.content}</Text>

      <View className={style["tag-list"]}>
        {dream.tags.map((tag) => (
          <View className={style["tag"]} key={tag}>
            {tag}
          </View>
        ))}
      </View>
    </View>
  );
};

export default DreamCard;
