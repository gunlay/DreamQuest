import { View, Text } from '@tarojs/components';
import { FC } from 'react';
import style from './index.module.scss';

const Loading: FC<{
  loadingText: string;
}> = ({ loadingText }) => {
  return (
    <View className={style['loading-wrapper']}>
      <View className={style['loading-spinner']} />
      <Text className={style['loading-text']}>{loadingText}</Text>
    </View>
  );
};
export default Loading;
