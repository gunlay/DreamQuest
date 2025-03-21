// components/Appbar/index.tsx
import { View, Text } from "@tarojs/components";
import { useEffect } from "react";
import { useSystemStore } from "@/store/systemStore";
import styles from "./index.module.scss";

export interface AppbarProps {
  type?: "default" | "sticky" | "immersive";
  title?: string;
}

const Appbar = ({ type = "default", title = "" }: AppbarProps) => {
  const { statusBarHeight, titleBarHeight, initSystemInfo } = useSystemStore();

  useEffect(() => {
    initSystemInfo();
  }, []);

  return (
    <View
      className={`${styles.appbar} ${styles[type]}`}
      style={{ paddingTop: `${statusBarHeight}px` }}
    >
      <View
        className={styles.navbar}
        style={{
          height: `${titleBarHeight}px`,
        }}
      >
        {type !== "immersive" && <Text className={styles.title}>{title}</Text>}
      </View>
    </View>
  );
};

export default Appbar;
