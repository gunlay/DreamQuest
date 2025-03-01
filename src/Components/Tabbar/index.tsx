import { FC, useState } from "react";
import Taro, { useDidShow } from "@tarojs/taro";
import classNames from "classnames";
import { Image, Text, View } from "@tarojs/components";
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
      <Text>登录</Text>
    </View>
  );
};

const Tabbar: FC<{ currentTab: number }> = ({ currentTab }) => {
  const { tabs, switchTab } = useTabbarStore();
  const [isLogin, setIsLogin] = useState(false);
  const onClickItem = (_, index) => {
    if (currentTab === index) return;
    switchTab(index);
  };
  useDidShow(() => {
    Taro.hideTabBar().catch(() => 0);
  });

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
                ? `@/assets/images/tabbar/${item.key}_selected`
                : `@/assets/images/tabbar/${item.key}`
            }
            className={styles.icon}
          />
          <Text className={styles.text}>{item.text}</Text>
        </View>
      ))}
      {!isLogin ? (
        <LoginButton className={styles["login-btn-position"]} />
      ) : null}
    </View>
  );
};
export default Tabbar;
