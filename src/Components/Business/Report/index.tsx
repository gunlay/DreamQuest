import { Text, View } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import classNames from 'classnames';
import { FC, useState } from 'react';
import { homeApi } from '@/api/home';
import { profileApi } from '@/api/profile';
import { DreamCardDTO } from '@/api/types/record';
import Loading from '@/Components/Loading';
import { useLoginStore } from '@/store/loginStore';
import { useReportStore } from '@/store/report';
import { generateAIAnalysis, generateReportContent, ReportParams } from './useReportHooks';

// eslint-disable-next-line import/order
import style from './index.module.scss';

const ReportContent: FC<{
  type: 'month' | 'week';
}> = ({ type }) => {
  const { retryFlag, setFlag } = useReportStore();
  const { isLogin } = useLoginStore();
  const [report, setReport] = useState<ReportParams | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);
  const loadDreamsAndAnalyze = async () => {
    let _data: DreamCardDTO[] = [];
    if (generating) return;
    setGenerating(true);
    try {
      if (isLogin) {
        if (type === 'week') {
          _data = await homeApi.fetchWeekMessage();
        } else if (type === 'month') {
          _data = await homeApi.fetchWeekMessage();
        }
      } else {
        setReport({
          ...generateReportContent(_data, type),
        });
        setGenerating(false);
        return;
      }
      const aiSuggestion = await generateAIAnalysis(type, retryFlag[type]);
      setFlag(type, false);

      setReport({
        ...generateReportContent(_data, type),
        ...aiSuggestion,
      });
    } catch (error) {
      console.error('获取月报失败:', error);
    }
    setGenerating(false);
  };
  useDidShow(() => {
    loadDreamsAndAnalyze();
  });
  return (
    <>
      {generating ? (
        <Loading loadingText={`正在生成${type === 'week' ? '周报' : '月报'}...`}></Loading>
      ) : (
        <View className={classNames(style['report-content'])}>
          {report?.keywords ? (
            <View className={style['report-section']}>
              <Text className={style['section-title']}>📊 关键词</Text>
              <Text className={style['section-content']}>{report?.keywords}</Text>
            </View>
          ) : null}

          {/* <!-- 情绪趋势 --> */}
          {report?.emotionTrend ? (
            <View className={style['report-section']}>
              <Text className={style['section-title']}>📈 情绪趋势</Text>
              <Text className={style['section-content']}>{report?.emotionTrend}</Text>
            </View>
          ) : null}

          {/* <!-- 梦境解析 --> */}
          {report?.analysis ? (
            <View className={style['report-section']}>
              <Text className={style['section-title']}>💭 梦境解析</Text>
              {report?.analysis.map((sg) => (
                <View key={sg} className={style['section-content']}>
                  {sg}
                </View>
              ))}
            </View>
          ) : null}

          {/* <!-- AI建议 --> */}
          {report?.aiSuggestion ? (
            <View className={style['report-section']}>
              <Text className={style['section-title']}>🤖 AI建议</Text>
              {report?.aiSuggestion.map((sg) => (
                <View key={sg} className={style['section-content']}>
                  {sg}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      )}
    </>
  );
};
export default ReportContent;
