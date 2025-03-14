import { FC } from "react";
import Taro from "@tarojs/taro";
import { Image, Text, View } from "@tarojs/components";
import { DreamCardVO } from "@/api/types/record";
import style from "./index.module.scss";

const DreamCard: FC<{
  dream: DreamCardVO;
}> = ({ dream }) => {
  const viewDreamDetail = () => {
    Taro.navigateTo({
      url: `/pages/analysis/index?chatId=${dream.chatId}`,
    });
  };
  return (
    <View
      className={style["dream-card"]}
      key={dream.id}
      onClick={viewDreamDetail}
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

      {
        dream.tags?.length ?<View className={style["tag-list"]}>
          {dream.tags.map((tag) => (
            <View className={style["tag"]} key={tag}>
              {tag}
            </View>
          ))}
        </View> : null
      }
    </View>
  );
};

export default DreamCard;
