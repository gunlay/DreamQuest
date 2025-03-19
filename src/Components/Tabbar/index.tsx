import { Image, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import { FC, useEffect, useState } from 'react';
import { useLoginStore } from '@/store/loginStore';
import { useTabbarStore } from '@/store/tabbarStore';
import styles from './index.module.scss';

const LoginButton: FC<{ className?: string }> = ({ className }) => {
  const login = () => {
    Taro.navigateTo({
      url: '/pages/sub/login/index',
    });
  };
  return (
    <View className={classNames(styles['login-btn'], className)} onClick={login}>
      <Image
        src="https://aloss-qinghua-image.oss-cn-shanghai.aliyuncs.com/images/record_selected.png"
        className={styles.icon}
      ></Image>
      <View>登录</View>
    </View>
  );
};

const Tabbar: FC<{ currentTab: number }> = ({ currentTab }) => {
  const { tabs, switchTab } = useTabbarStore();
  const { isLogin: _isLogin, checkLogin } = useLoginStore();
  const [isLogin, setIsLogin] = useState(false);
  const onClickItem = (_, index) => {
    if (currentTab === index) return;
    switchTab(index);
  };

  useEffect(() => {
    checkLogin().then((res) => {
      if (res) {
        setIsLogin(res);
      }
    });
  }, [_isLogin]);

  return (
    <>
      <View className={styles.tabbar}>
        {tabs.map((item, index) => (
          <View
            key={item.pagePath}
            className={`${styles.tabItem} ${currentTab === index ? styles.active : ''}`}
            onClick={() => onClickItem(item, index)}
            style={{
              display: item.isLogin && !isLogin ? 'none' : 'flex',
              width: `calc(100% / ${tabs.length})`,
            }}
          >
            <Image
              src={currentTab === index ? item.iconPath : item.selectedIconPath}
              className={styles.icon}
            />
            <View className={styles.text}>{item.text}</View>
          </View>
        ))}
        {!isLogin ? <LoginButton className={styles['login-btn-position']} /> : null}
      </View>
      <View className="safe-area-inset-bottom"></View>
    </>
  );
};
export default Tabbar;
