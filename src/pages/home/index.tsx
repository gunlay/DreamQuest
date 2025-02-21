import { View, Text, Image, Input } from '@tarojs/components';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import Taro from '@tarojs/taro';
import Vocie from '@/assets/icon/voice.png'
import MainBg from '@/assets/image/main/main_bg.png'
import RecodSelected from '@/assets/image/tabbar/record_selected.png'
import { IndexState, DreamData, WeeklyReport, DateInfo } from './types';
import DreamInput from './DreamInput/index';
// import DreamAnalysis from './DreamAnalysis/index';
import style from './index.module.scss';
import TodayFortune from './TodayFortune';


const defaultWeeklyReport: WeeklyReport = {
  keywords: '开始记录你的第一个梦境吧',
  analysis: '开始记录梦境是了解自己内心世界的第一步。每个梦境都是独特的，都值得被记录和理解。',
  emotionTrend: '开始记录梦境，探索内心情感的变化。',
  aiSuggestion: '建议在睡醒后第一时间记录梦境，这样能记住更多细节。可以从印象最深刻的片段开始写起，慢慢培养记录习惯。'
};

const Home: React.FC = () => {
  const [dateInfo, setDateInfo] = useState<DateInfo>({
    date: '',
    weekday: ''
  })
  const [isFortuneExpanded, setIsFortuneExpanded] = useState<boolean>(false)
  const [weeklyReport, setWeeklyRepory] = useState<WeeklyReport>(defaultWeeklyReport)
  const [state, setState] = useState<IndexState>({
    fortune: {
      overall: '',
      career: '',
      love: '',
      money: '',
      health: '',
      luckyNumber: '',
      luckyColor: '',
      luckyDirection: ''
    },
    weeklyReport: defaultWeeklyReport,
    isReportExpanded: false,
    showDreamInput: false,
    isGeneratingReport: false
  });

  const updateDateInfo = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    setDateInfo({
        date: `${year}.${month}.${day}`,
        weekday: `周${weekdays[now.getDay()]}`
    })
  };

  const fetchWeeklyReport = async () => {
    setState(prev => ({ ...prev, isGeneratingReport: true }));

    try {
      const weeklyDreams = getWeeklyDreams();

      if (weeklyDreams.length === 0) {
        setState(prev => ({
          ...prev,
          weeklyReport: defaultWeeklyReport,
          isGeneratingReport: false
        }));
        return;
      }

      const reportContent = await generateWeeklyReportContent(weeklyDreams);
      setState(prev => ({
        ...prev,
        weeklyReport: reportContent,
        isGeneratingReport: false
      }));
    } catch (error) {
      console.error('获取周报失败:', error);
      setState(prev => ({
        ...prev,
        isGeneratingReport: false,
        weeklyReport: defaultWeeklyReport
      }));
      Taro.showToast({
        title: '周报生成失败',
        icon: 'error'
      });
    }
  };

  const toggleReport = () => {
    setState(prev => ({
      ...prev,
      isReportExpanded: !prev.isReportExpanded
    }));
  };

  const showDreamInput = () => {
    setState(prev => ({ ...prev, showDreamInput: true }));
  };

  const hideDreamInput = () => {
    setState(prev => ({ ...prev, showDreamInput: false }));
  };

  const handleDreamSave = (dreamData: DreamData) => {
    const existingDreams = Taro.getStorageSync('dreams') || [];
    const updatedDreams = [dreamData, ...existingDreams];
    Taro.setStorageSync('dreams', updatedDreams);

    hideDreamInput();
    fetchWeeklyReport();

    Taro.navigateTo({
      url: '/pages/analysis/analysis'
    });
  };

  useEffect(() => {
    updateDateInfo();
    // fetchDreamTheory();
    fetchWeeklyReport();
  }, []);

  return (
    <View className={style['container']}>
      <Image
        className={style['bg-image']}
        src={MainBg}
        mode='aspectFill'
      />

      {/* Header */}
      <View className={style['header']}>
        <View className={style['logo-wrapper']}>
          <Image
            className={style['logo']}
            src={RecodSelected}
            mode='aspectFit'
          />
          <Text className={style['app-name']}>梦寻</Text>
        </View>
        <View className={style['date-wrapper']}>
          <Text className={style['date']}>{dateInfo.date}</Text>
          <Text className={style['weekday']}>{dateInfo.weekday}</Text>
        </View>
      </View>

      {/* Dream Theory */}
      <View className={style['dream-theory']}>
        <View className={style['theory-title']}>
          <Text>✨</Text>
          <Text className={style['theory-txt']}>弗洛伊德的梦境理论</Text>
        </View>
        <Text className={style['theory-content']}>
          弗洛伊德认为，梦境是潜意识欲望和冲突的表现，尤其是那些被压抑的欲望。昨晚的梦，是不是某种未实现的渴望？
        </Text>
      </View>

      {/* Fortune Card */}
      <TodayFortune expandFortune={[isFortuneExpanded, setIsFortuneExpanded]} />
      

      {/* Weekly Report */}
      <View
        className={classNames(
          style['weekly-report'],
          isFortuneExpanded ? style.expanded : ''
        )}
        onClick={toggleReport}
      >
        <View className={style['card-title']}>
          <Text>🗒️ 梦境周报</Text>
        </View>

        {state.isGeneratingReport ? (
          <View className={style['loading-wrapper']}>
            <View className={style['loading-spinner']} />
            <Text className={style['loading-text']}>正在生成周报...</Text>
          </View>
        ) : (
          <View
            className={classNames(
              style['report-content'],
              isFortuneExpanded ? style.expanded : ''
            )}
          >
            <View className={style['report-section']}>
              <Text className={style['section-title']}>📊 关键词</Text>
              <Text className={style['section-content']}>{state.weeklyReport.keywords}</Text>
            </View>
            {/* Other report sections... */}
          </View>
        )}
      </View>

      {/* Input Section */}
      <View className={style['input-section']}>
        <View className={style['chat-bubble']}>昨晚梦到什么了嘛?记录一下吧 🤗</View>
        <View className={style['input-area']}>
          <View className={style['dream-input']} onClick={showDreamInput}>
            <Input placeholder='write your dream'
              placeholderStyle='color: rgba(60, 60, 67, 0.6)'
              disabled
            />
            <Image 
              className={style['voice-icon']} 
              src={Vocie}
              mode='aspectFit' 
            />
          </View>
        </View>
      </View>

      {/* Dream Input Component */}
      {state.showDreamInput && (
        <DreamInput
          show={state.showDreamInput}
          onSave={handleDreamSave}
          onClose={hideDreamInput}
        />
      )}
        {/* 添加梦境分析浮层 */}
      {/* <DreamAnalysis
        visible={state.showDreamAnalysis}
        dreamData={currentDream}
        onClose={onDreamAnalysisClose}
      /> */}
    </View>
  );
};

export default Home; 