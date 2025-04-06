import { Button, Image, ITouchEvent, View } from '@tarojs/components';
import { FC } from 'react';
import Share from '@/assets/icon/share.png';
import style from './index.module.scss';

const ShareBtn: FC<{
  disabled?: boolean;
  onShare?: (e: ITouchEvent) => void;
}> = ({ disabled, onShare }) => {
  const handleShare = (e: ITouchEvent) => {
    // e.stopPropagation();
    onShare?.(e);
    if (disabled) return;
  };
  return (
    <Button
      className={style['btn-wrapper']}
      onClick={handleShare}
      openType={disabled ? undefined : 'share'}
    >
      <View className={style['btn-bg']}></View>
      <Image src={Share} mode="aspectFill" className={style['btn-icon']}></Image>
      <View className={style['btn-txt']}>分享</View>
    </Button>
  );
};
export default ShareBtn;
