// stores/useSystemStore.ts
import Taro from "@tarojs/taro";
import { create } from "zustand";

interface SystemState {
  statusBarHeight: number;
  titleBarHeight: number;
  appBarHeight: number;
  isAndroid: boolean;
  isIOS: boolean;
  initSystemInfo: () => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  statusBarHeight: 0,
  titleBarHeight: 0,
  appBarHeight: 0,
  isAndroid: false,
  isIOS: false,
  initSystemInfo: () => {
    const systemInfo = Taro.getSystemInfoSync();
    const menuBtn = Taro.getMenuButtonBoundingClientRect();
    set({
      statusBarHeight: systemInfo.statusBarHeight || 0,
      titleBarHeight: menuBtn.height,
      appBarHeight: (systemInfo.statusBarHeight || 0) + menuBtn.height,
      isAndroid: systemInfo.platform === "android",
      isIOS: systemInfo.platform === "ios",
    });
  },
}));
