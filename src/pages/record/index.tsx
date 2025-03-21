import { View, Image, Text } from '@tarojs/components';
import { useState } from 'react';
import PageContainer from '@/Components/PageContainer';
import { useSystemStore } from '@/store/systemStore';
import CalendarView from './CalendarView';
import style from './index.module.scss';
import ListView from './ListView';

const Record: React.FC = () => {
  const MainBg = 'https://aloss-qinghua-image.oss-cn-shanghai.aliyuncs.com/images/Wallpaper.png';
  const { titleBarHeight, statusBarHeight, appBarHeight } = useSystemStore();
  const [currentTab, setCurrentTab] = useState<string>('list');

  return (
    <PageContainer
      appbar={{
        type: 'immersive',
      }}
    >
      <View className={style['container']} style={{ paddingTop: `${appBarHeight}px` }}>
        <Image className={style['bg-image']} src={MainBg} mode="aspectFill"></Image>
        <View
          className={`${style['fixed-header']} ${
            currentTab === 'calendar' ? style['calendar-header-only'] : ''
          }`}
          style={{ top: `${statusBarHeight}px`, height: `${titleBarHeight}px` }}
        >
          <View className={style['tab-header']}>
            <View
              className={`${style['tab-item']} ${currentTab === 'list' ? style.active : ''}`}
              onClick={() => setCurrentTab('list')}
              data-tab="list"
            >
              <Text>列表</Text>
              <View className={style['tab-line']}></View>
            </View>
            <View
              className={`${style['tab-item']} ${currentTab === 'calendar' ? style.active : ''}`}
              onClick={() => setCurrentTab('calendar')}
              data-tab="calendar"
            >
              <Text>日历</Text>
              <View className={style['tab-line']}></View>
            </View>
          </View>
        </View>

        <View className={style['contents']}>
          {currentTab === 'list' ? <ListView /> : <CalendarView />}
        </View>
      </View>
    </PageContainer>
  );
};

export default Record;
