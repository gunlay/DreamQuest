import { useRef } from "react";
import Taro from "@tarojs/taro";
import { Button, Image, Text, View } from "@tarojs/components";
import { useLoginStore } from "@/store/loginStore";
import LoginBanner from "@/assets/image/login/login_banner.png";
import { AgreementPageType } from "../agreement/data";
import style from "./index.module.scss";

const Login = () => {
  const login = useLoginStore((state) => state.login);
  const logining = useRef(false)
  const handleLogin = async () => {
    if (logining.current) return
    logining.current = true
    try {
      const success = await login();
      if (success) {
        // 处理登录后跳转
        const redirectUrl = Taro.getCurrentInstance().router?.params.redirect;
        if (redirectUrl) {
          Taro.redirectTo({ url: decodeURIComponent(redirectUrl) });
        } else {
          Taro.switchTab({ url: "/pages/home/index" });
        }
      }
    } catch (err) {

    }
    logining.current = false
  };
  const showUserAgreement = (pageType: string) => {
    Taro.navigateTo({
      url: `/pages/agreement/index?pageType=${pageType}`,
    });
  };

  return (
    <View className={style.container}>
      <View className={style["login-box"]}>
        <Image
          className={style.logo}
          src={LoginBanner}
          mode="aspectFit"
        ></Image>
        <View className={style.title}>欢迎使用梦寻</View>
        <View className={style.desc}>请授权登录以使用完整功能</View>
        <Button
          className={style["login-btn"]}
          onClick={handleLogin}
          type="primary"
          // openType="getRealtimePhoneNumber"
          onGetRealTimePhoneNumber={(x) => {
            console.log("x", x);
          }}
          // hover-className="button-hover"
        >
          微信一键登录
        </Button>
        <View className={style["privacy-policy"]}>
          登录即代表您同意
          <Text
            className={style.link}
            onClick={() => showUserAgreement(AgreementPageType.AGREEMENT)}
          >
            《用户协议》
          </Text>
          和
          <Text
            className={style.link}
            onClick={() => showUserAgreement(AgreementPageType.PRIVACY)}
          >
            《隐私政策》
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Login;
