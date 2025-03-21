import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect } from 'react';
import { useTabbarStore } from '@/store/tabbarStore';
import Appbar from '../Appbar';
import Tabbar from '../Tabbar';
import styles from './index.module.scss';

interface PageContainerProps {
  children: React.ReactNode;
  showTabbar?: boolean;
  appbar?: {
    type?: 'default' | 'sticky' | 'immersive';
    title?: string;
  };
}

const PageContainer = ({
  children,
  showTabbar = true,
  appbar = {
    type: 'default',
    title: '',
  },
}: PageContainerProps) => {
  const { tabs, currentTab, setCurrentPage } = useTabbarStore();

  useEffect(() => {
    const currentPage = Taro.getCurrentInstance().router?.path || '';
    const tabIndex = tabs.findIndex((item) => `/${item.pagePath}` === currentPage);
    setCurrentPage(tabIndex);
  }, []);

  return (
    <View className={styles.container}>
      <Appbar {...appbar}></Appbar>
      {children}

      {showTabbar && currentTab > -1 ? <Tabbar currentTab={currentTab} /> : null}
    </View>
  );
};

export default PageContainer;
