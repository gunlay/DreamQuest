// stores/keepAliveStore.ts
import { ReactNode } from 'react';
import { create } from 'zustand';

type CacheItem = {
  node: ReactNode; // 缓存的 React 组件
  isActive: boolean; // 是否激活（显示）
};

type KeepAliveStore = {
  cache: Record<string, CacheItem>;
  // 动态添加缓存
  setKeepAlive: (key: string, node: ReactNode) => void;
  // 动态移除缓存
  removeKeepAlive: (key: string) => void;
  // 激活/隐藏缓存
  toggleKeepAlive: (key: string, isActive: boolean) => void;
};

export const useKeepAliveStore = create<KeepAliveStore>((set) => ({
  cache: {},
  setKeepAlive: (key, node) =>
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: { node, isActive: true },
      },
    })),
  removeKeepAlive: (key) =>
    set((state) => {
      const newCache = { ...state.cache };
      delete newCache[key];
      return { cache: newCache };
    }),
  toggleKeepAlive: (key, isActive) =>
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: { ...state.cache[key], isActive },
      },
    })),
}));
