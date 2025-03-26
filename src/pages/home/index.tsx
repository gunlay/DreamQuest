import { View, Text, Image, Input } from '@tarojs/components';
import { useDidShow, useShareAppMessage } from '@tarojs/taro';
import classNames from 'classnames';
import { useState } from 'react';
import { homeApi } from '@/api/home';
import SendIcon from '@/assets/icon/send.png';
import RecodSelected from '@/assets/image/tabbar/record_selected.png';
import PageContainer from '@/Components/PageContainer';
import { useSystemStore } from '@/store/systemStore';
import DreamInput from './DreamInput/index';
import style from './index.module.scss';
import TodayFortune from './TodayFortune';
import WeeklyReport from './WeeklyReport';

const Home: React.FC = () => {
  const MainBg = 'https://aloss-qinghua-image.oss-cn-shanghai.aliyuncs.com/images/Wallpaper.png';
  const { appBarHeight } = useSystemStore();
  const [homeInfo, setHomeInfo] = useState<{
    content: string;
    date: string;
    title: string;
    week: string;
  }>({
    content: '',
    date: '',
    title: '',
    week: '',
  });

  const [showDreamInput, setShowDreamInput] = useState<boolean>(false);

  useShareAppMessage(() => {
    return {
      title: '梦里有答案，醒来就知道～',
      path: '/pages/home/index',
      imageUrl: 'https://aloss-qinghua-image.oss-cn-shanghai.aliyuncs.com/images/WechatIMG636.jpg',
    };
  });

  useDidShow(() => {
    homeApi.fetchHomeInfo().then((res) => {
      setHomeInfo(res);
    });
  });

  return (
    <PageContainer
      appbar={{
        type: 'immersive',
      }}
    >
      <View
        className={classNames(style['container'], 'safe-area-inset-bottom')}
        style={{ paddingTop: `${appBarHeight}px` }}
      >
        <Image className={style['bg-image']} src={MainBg} mode="aspectFill" />

        {/* Header */}
        <View className={style['header']}>
          <View className={style['logo-wrapper']}>
            <Image className={style['logo']} src={RecodSelected} mode="aspectFit" />
            <Text className={style['app-name']}>梦寻</Text>
          </View>
          <View className={style['date-wrapper']}>
            <Text className={style['date']}>{homeInfo.date}</Text>
            <Text className={style['weekday']}>{homeInfo.week}</Text>
          </View>
        </View>

        {/* Dream Theory */}
        <View className={style['dream-theory']}>
          <View className={style['theory-title']}>
            <Text>✨</Text>
            <Text className={style['theory-txt']}>{homeInfo.title}</Text>
          </View>
          <Text className={style['theory-content']}>{homeInfo.content}</Text>
        </View>

        {/* Fortune Card */}
        <TodayFortune />

        {/* Weekly Report */}
        <WeeklyReport />

        {/* Input Section */}
        <View className={classNames(style['input-section'])}>
          <View className={style['chat-bubble']}>昨晚梦到什么了嘛?记录一下吧 🤗</View>
          <View className={style['input-area']}>
            <View className={style['dream-input']} onClick={() => setShowDreamInput(true)}>
              <Input
                placeholder="write your dream"
                placeholderStyle="color: rgba(60, 60, 67, 0.6)"
                disabled
              />
            </View>
            <View className={style['send-icon']}>
              <Image src={SendIcon} mode="aspectFit" className={style.icon} />
            </View>
          </View>
        </View>

        {/* Dream Input Component */}
        <DreamInput
          date={homeInfo.date}
          show={showDreamInput}
          onClose={() => setShowDreamInput(false)}
        />
      </View>
    </PageContainer>
  );
};

export default Home;
