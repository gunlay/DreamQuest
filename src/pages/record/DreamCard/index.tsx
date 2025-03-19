import { Image, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { FC } from 'react';
import { DreamCardDTO } from '@/api/types/record';
import style from './index.module.scss';

const weekMap = {
  Monday: '周一',
  Tuesday: '周二',
  Wednesday: '周三',
  Thursday: '周四',
  Friday: '周五',
  Saturday: '周六',
  Sunday: '周日',
};

const DreamCard: FC<{
  dream: DreamCardDTO;
}> = ({ dream }) => {
  const viewDreamDetail = () => {
    Taro.navigateTo({
      url: `/pages/sub/analysis/index?chatId=${dream.chatId}`,
    });
  };

  return (
    <View
      className={style['dream-card']}
      key={dream.chatId}
      onClick={viewDreamDetail}
      data-id={dream.chatId}
    >
      <View className={style['card-header']}>
        <Text className={style['card-title']}>{dream.title}</Text>
        <Text className={style['card-date']}>
          {dream.date} {weekMap[dream.week as keyof typeof weekMap]}
        </Text>
      </View>

      <Image className={style['dream-image']} src={dream.image} mode="aspectFill"></Image>

      <Text className={style['dream-content']}>{dream.desc}</Text>

      {dream.tags?.length ? (
        <View className={style['tag-list']}>
          {dream.tags.map((tag) => (
            <View className={style['tag']} key={tag}>
              {tag}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default DreamCard;
