import { Image, View } from '@tarojs/components';
import { FC } from 'react';
import Share from '@/assets/icon/share.png';
import style from './index.module.scss';

const ShareBtn: FC<{
  onShare: () => void;
}> = ({ onShare }) => {
  const handleShare = (e) => {
    e.stopPropagation();
    onShare();
  };
  return (
    <View className={style['btn-wrapper']} onClick={handleShare}>
      <View className={style['btn-bg']}></View>
      <Image src={Share} mode="aspectFill" className={style['btn-icon']}></Image>
      <View className={style['btn-txt']}>分享</View>
    </View>
  );
};
export default ShareBtn;
