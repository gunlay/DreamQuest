import { FC, useEffect, useState } from "react";
import Taro, { useDidShow } from "@tarojs/taro";
import classNames from "classnames";
import { useLoginStore } from "@/store/loginStore";
import { Image, View } from "@tarojs/components";
import { useTabbarStore } from "@/store/tabbarStore";
import styles from "./index.module.scss";

const LoginButton: FC<{ className?: string }> = ({ className }) => {
  const login = () => {
    Taro.navigateTo({
      url: "/pages/login/index",
    });
  };
  return (
    <View
      className={classNames(styles["login-btn"], className)}
      onClick={login}
    >
      {/* <Image></Image> */}
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
  // useDidShow(() => {
  //   Taro.hideTabBar().catch(() => 0);
  // });

  useEffect(() => {
    checkLogin().then((res) => {
      if (res) {
        setIsLogin(res);
      }
    });
  }, [_isLogin]);

  return (
    <View className={`${styles.tabbar} safe-area-inset-bottom`}>
      {tabs.map((item, index) => (
        <View
          key={item.pagePath}
          className={`${styles.tabItem} ${
            currentTab === index ? styles.active : ""
          }`}
          onClick={() => onClickItem(item, index)}
          style={{
            display: item.isLogin && !isLogin ? "none" : "flex",
            width: `calc(100% / ${tabs.length})`,
          }}
        >
          <Image
            src={
              currentTab === index
                ? item.iconPath
                : item.selectedIconPath
            }
            className={styles.icon}
          />
          <View className={styles.text}>{item.text}</View>
        </View>
      ))}
      {!isLogin ? (
        <LoginButton className={styles["login-btn-position"]} />
      ) : null}
    </View>
  );
};
export default Tabbar;
