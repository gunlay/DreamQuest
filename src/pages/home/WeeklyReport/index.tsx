import { Text, View } from '@tarojs/components';
import classNames from 'classnames';
import { useState } from 'react';
import ReportContent from '@/Components/Business/Report';
import style from './index.module.scss';

const WeeklyReport = () => {
  const [isReportExpanded, setIsReportExpanded] = useState<boolean>(false);

  return (
    <View
      className={classNames(style['weekly-report'], isReportExpanded ? style.expanded : '')}
      onClick={() => setIsReportExpanded((prev) => !prev)}
    >
      <View className={style['card-title']}>
        <Text>🗒️ 梦境周报</Text>
      </View>
      <View className={classNames(style['report-wrapper'], isReportExpanded ? style.expanded : '')}>
        <ReportContent type="week" />
      </View>
    </View>
  );
};

export default WeeklyReport;
