import { http } from "@/utils/request/index";
import Taro from "@tarojs/taro";
import { UserInfo } from "./types/user";

export const userApi = {
  login: async () => {
    const { code } = await Taro.login();
    Taro.setStorageSync("logincode", code);

    return http
      .post<{ token: string; sessionKey: string }>("/dream/wx/login", { code })
      .then((res) => res);
  },
  saveUserInfo: async (userInfo: Omit<UserInfo, "phone">) => {
    return http.post("/dream/wx/saveUserInfo", userInfo).then((res) => res);
  },
};
