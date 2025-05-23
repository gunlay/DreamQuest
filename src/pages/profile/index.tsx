import { View, Text, Image, Button } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import { useState } from 'react';
import { profileApi } from '@/api/profile';
import { ChatStatiticDTO } from '@/api/types/profile';
import Vip from '@/assets/icon/vip.png';
import ReportContent from '@/Components/Business/Report';
import PageContainer from '@/Components/PageContainer';
import { useLoginStore } from '@/store/loginStore';
import { useSystemStore } from '@/store/systemStore';
import style from './index.module.scss';

export default function Profile() {
  const MainBg = 'https://aloss-qinghua-image.oss-cn-shanghai.aliyuncs.com/images/Wallpaper.png';
  const { appBarHeight } = useSystemStore();
  const { isLogin } = useLoginStore();
  const [statistic, setStatistic] = useState<ChatStatiticDTO>({
    moreDate: '--',
    num: 0,
  });
  const loadDreamsAndAnalyze = async () => {
    if (!isLogin) return;
    profileApi.fetchChatStatistics().then((_statistic) => {
      setStatistic(_statistic);
    });
  };

  useDidShow(() => {
    loadDreamsAndAnalyze();
  });
  return (
    <PageContainer
      appbar={{
        type: 'immersive',
      }}
    >
      <View className={style['container']} style={{ paddingTop: `${appBarHeight}px` }}>
        <Image className={style['bg-image']} src={MainBg} mode="aspectFill"></Image>

        <View className={style['fixed-content']} style={{ top: `${appBarHeight}px` }}>
          <View className={style['analysis-section']}>
            <Text className={style['title']}>综合解析</Text>
            <Text className={style['subtitle']}>
              大模型基于你记录的所有梦境，解析你内心深处的焦虑、目标，综合回答你的问题～
            </Text>

            <View className={style['stats-board']}>
              <View className={style['stat-item']}>
                <Text className={style['stat-num']}>{isLogin ? statistic.num : '--'}</Text>
                <Text className={style['stat-label']}>梦境数量</Text>
              </View>
              <View className={style['stat-item']}>
                <Text className={style['stat-num']}>{statistic.moreDate}</Text>
                <Text className={style['stat-label']}>最常做梦时间</Text>
              </View>
            </View>
          </View>

          <View className={style['vip-card']}>
            <View className={style['vip-info']}>
              <View className={style['vip-title']}>
                <Image className={style['vip-icon']} src={Vip} mode="aspectFit"></Image>
                <Text className={style['vip-txt']}>尊享 VIP 做梦卡</Text>
              </View>
              <Text className={style['vip-subtitle']}>开通VIP，扩充大模型的梦境记忆数量</Text>
            </View>
            <Button className={style['vip-button']}>敬请期待</Button>
          </View>
        </View>

        <View
          className={style['chat-container']}
          style={{
            top: `${appBarHeight + 243}px`,
          }}
        >
          <View className={style['chat-area']}>
            <View className={style['top-white']}></View>
            <View className={style['report-wrapper']}>
              <ReportContent type="month" />
            </View>
          </View>
        </View>
      </View>
    </PageContainer>
  );
}
