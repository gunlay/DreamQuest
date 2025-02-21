import { create } from 'zustand';

const homeStore = create((set) => ({
  count: 0, // 状态
  increment: () => set((state) => ({ count: state.count + 1 })), // 增加状态
  decrement: () => set((state) => ({ count: state.count - 1 })), // 减少状态
}));

export default homeStore;