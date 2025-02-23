import { create } from "zustand";

const userStore = create((set) => ({
  userInfo: {}, // 状态
  setUserInfo: (_userInfo) =>
    set((state) => {
      return {
        userInfo: {
          ...state.userInfo,
          _userInfo,
        },
      };
    }), // 增加状态
  getUserInfo: () => set((state) => ({ count: state.count - 1 })), // 减少状态
}));

export default userStore;
