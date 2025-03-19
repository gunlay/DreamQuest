import Taro from '@tarojs/taro';
import { http } from '@/utils/request/index';
import { UserInfo } from './types/user';

export const userApi = {
  login: async ({ phoneCode }) => {
    const { code } = await Taro.login();
    Taro.setStorageSync('logincode', code);

    return http
      .post<{ token: string; sessionKey: string }>('/dream/wx/login', { code, phoneCode })
      .then((res) => res);
  },
  saveUserInfo: async (userInfo: Omit<UserInfo, 'phone'>) => {
    return http.post('/dream/wx/saveUserInfo', userInfo).then((res) => res);
  },
};
