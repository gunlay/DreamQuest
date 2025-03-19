import Taro from '@tarojs/taro';
import { create } from 'zustand';
import { userApi } from '@/api/user';
import { useUserStore } from './userStore';

interface LoginState {
  isLogin: boolean;
  token: string | null;
  login: (phoneCode: string) => Promise<boolean>;
  // logout: (force?: boolean) => void;
  checkLogin: () => Promise<boolean>;
}

export const useLoginStore = create<LoginState>((set, get) => ({
  isLogin: false,
  token: '',

  login: async (phoneCode: string) => {
    try {
      // 1. 获取用户信息
      await useUserStore.getState().getWxUserProfile();
      // 2. 调用后端登录接口
      const data = await userApi.login({ phoneCode });
      // 3.保存token
      Taro.setStorageSync('auth_token', data.token);
      set({ isLogin: true, token: data.token });
      // 4. 保存用户信息
      await userApi.saveUserInfo(useUserStore.getState().userInfo);
      Taro.setStorageSync('session_key', data.sessionKey);
      return true;
    } catch (error) {
      // Taro.showToast({ title: '登录失败', icon: 'none' });
      return false;
    }
  },

  // logout: (force = false) => {
  //   Taro.removeStorage({ key: "auth_token" });
  // useUserStore.getState().clearUserInfo()
  //   set({ isLogin: false, token: null });
  //   // if (force && !isLoginPage()) navigateToLogin()
  // },

  checkLogin: async () => {
    try {
      const { token } = get();
      if (token) return true;

      const storage = await Taro.getStorage({ key: 'auth_token' });
      if (storage.data) {
        set({ isLogin: true, token: storage.data });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
