import { create } from "zustand";
import Taro from "@tarojs/taro";

interface UserInfo {
  nickName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  openId?: string;
  unionId?: string;
}

interface UserState {
  userInfo: UserInfo | null;
  updateUserInfo: (info: UserInfo) => void;
  clearUserInfo: () => void;
  getWxUserProfile: () => Promise<void>;
  getWxPhoneNumber: (encryptedData: string, iv: string) => Promise<void>;
  fetchUserInfo: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  userInfo: null,

  updateUserInfo: (info) => {
    const newInfo = { ...get().userInfo, ...info };
    set({ userInfo: newInfo });
    Taro.setStorage({ key: "user_info", data: newInfo });
  },

  clearUserInfo: () => {
    set({ userInfo: null });
    Taro.removeStorage({ key: "user_info" });
  },

  getWxUserProfile: async () => {
    try {
      const { userInfo } = await Taro.getUserProfile({
        desc: "用于完善会员资料",
      });
      get().updateUserInfo(userInfo);
    } catch (error) {
      Taro.showToast({ title: "获取用户信息失败", icon: "none" });
    }
  },

  getWxPhoneNumber: async (encryptedData, iv) => {
    try {
      const { data } = await Taro.request({
        url: "/api/getPhoneNumber",
        method: "POST",
        data: {
          encryptedData,
          iv,
          sessionKey: Taro.getStorageSync("session_key"),
        },
      });

      if (data.phoneNumber) {
        get().updateUserInfo({ phoneNumber: data.phoneNumber });
      }
    } catch (error) {
      Taro.showToast({ title: "获取手机号失败", icon: "none" });
    }
  },

  fetchUserInfo: async () => {
    try {
      const { data } = await Taro.request({
        url: "/api/userInfo",
        method: "GET",
      });
      get().updateUserInfo(data);
    } catch (error) {
      console.error("获取用户信息失败:", error);
    }
  },
}));
