// stores/useSystemStore.ts
import Taro from '@tarojs/taro';
import { create } from 'zustand';

interface SystemState {
  rpx: number;
  statusBarHeight: number;
  titleBarHeight: number;
  appBarHeight: number;
  isAndroid: boolean;
  isIOS: boolean;
  initSystemInfo: () => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  rpx: 1,
  statusBarHeight: 0,
  titleBarHeight: 0,
  appBarHeight: 0,
  isAndroid: false,
  isIOS: false,
  initSystemInfo: () => {
    const systemInfo = Taro.getSystemInfoSync();
    const menuBtn = Taro.getMenuButtonBoundingClientRect();
    const screenWidth = systemInfo.screenWidth;
    set({
      rpx: screenWidth / 750,
      statusBarHeight: (systemInfo.statusBarHeight || 0) + 4,
      titleBarHeight: menuBtn.height,
      appBarHeight: (systemInfo.statusBarHeight || 0) + menuBtn.height,
      isAndroid: systemInfo.platform === 'android',
      isIOS: systemInfo.platform === 'ios',
    });
  },
}));
