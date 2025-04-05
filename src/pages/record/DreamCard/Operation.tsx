import { Image, View } from '@tarojs/components';
import { FC } from 'react';

import Delete from '@/assets/icon/delete.png';
import Share from '@/assets/icon/share.png';

import style from './Operation.module.scss';

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

const DeleteBtn: FC<{
  onDelete: () => void;
}> = ({ onDelete }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };
  return (
    <View className={style['btn-wrapper']} onClick={handleDelete}>
      <View className={style['btn-bg']}></View>
      <Image src={Delete} mode="aspectFill" className={style['btn-icon']}></Image>
      <View className={style['btn-txt']}>删除</View>
    </View>
  );
};

const Operation: FC<{
  onShare: () => void;
  onDelete: () => void;
}> = ({ onShare, onDelete }) => {
  return (
    <View className={style.operation}>
      <ShareBtn onShare={onShare} />
      <View className={style.divider} />
      <DeleteBtn onDelete={onDelete} />
    </View>
  );
};

export default Operation;
