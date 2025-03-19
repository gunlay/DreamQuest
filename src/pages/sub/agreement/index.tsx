import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import { agreementData, AgreementPageType, privacyData } from './data';
import style from './index.module.scss';

const Agreement = () => {
  const pageType =
    Taro.getCurrentInstance?.()?.router?.params?.pageType || AgreementPageType.AGREEMENT;
  const [sections] = useState<{ title: string; content: string }[]>(
    {
      [AgreementPageType.AGREEMENT]: agreementData,
      [AgreementPageType.PRIVACY]: privacyData,
    }[pageType] || []
  );
  return (
    <View className={style['container']}>
      <View className={style['title']}>
        {
          {
            [AgreementPageType.AGREEMENT]: '用户协议',
            [AgreementPageType.PRIVACY]: '隐私政策',
          }[pageType]
        }
      </View>
      <View className={style['content']}>
        {sections.map((item) => (
          <View className={style['section']} key={item.title}>
            <View className={style['section-title']}>{item.title}</View>
            <View className={style['section-content']}>{item.content}</View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Agreement;
