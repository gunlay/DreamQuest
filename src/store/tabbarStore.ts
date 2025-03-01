// stores/useTabbarStore.ts
import tabbarList from "@/Components/Tabbar/tabbarList";
import Taro from "@tarojs/taro";
import { create } from "zustand";

interface TabItem {
  key: string;
  pagePath: string;
  isLogin: boolean;
  // iconPath: string;
  // selectedIconPath: string;
  text: string;
}

interface TabbarState {
  tabs: TabItem[];
  currentTab: number;
  queryCache: Record<string, Record<string, unknown> | undefined>;
  setCurrentPage: (path: number) => void;
  switchTab: (i: number, query?: Record<string, unknown>) => void;
}

const queryCache: Record<string, Record<string, unknown> | undefined> = {};
tabbarList.forEach((tab) => {
  queryCache[`/${tab.pagePath}`] = {};
});

export const useTabbarStore = create<TabbarState>((set, get) => ({
  tabs: tabbarList,
  currentTab: 0,
  queryCache,
  setCurrentPage: (path: number) => set({ currentTab: path }),
  switchTab: (i: number, query?: Record<string, unknown>) => {
    const tab = get().tabs[i];
    set((state) => ({
      queryCache: {
        ...state.queryCache,
        [`/${tab.pagePath}`]: query || {},
      },
    }));
    Taro.switchTab({ url: `/${tab.pagePath}` }).then(() =>
      Taro.hideTabBar().catch(() => 0)
    );
    set({
      currentTab: i,
    });
  },
}));
