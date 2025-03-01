import Taro from "@tarojs/taro";
import { Button, Image, Text, View } from "@tarojs/components";
import { useLoginStore } from "@/store/loginStore";
import LoginBanner from "@/assets/image/login/login_banner.png";
import { AgreementPageType } from "../agreement/data";
import style from "./index.module.scss";

const Login = () => {
  const login = useLoginStore((state) => state.login);
  const handleLogin = async () => {
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
  };
  // const login = async () => {
  //   const { confirm } = await Taro.showModal({
  //     title: "用户协议和隐私政策",
  //     content:
  //       "在使用梦寻小程序前， 请务必仔细阅读并同意《用户协议》和《隐私政策》",
  //     confirmText: "同意",
  //     cancelText: "不同意",
  //   });
  //   console.log("confirm", confirm);
  //   if (!confirm) return;
  //   const { token } = await userApi.login();
  //   Taro.setStorageSync("token", token);
  //   const { userInfo } = await Taro.getUserInfo({
  //     withCredentials: true,
  //   });
  //   console.log("userInfo", userInfo);
  //   await userApi.saveUserInfo(userInfo);

  //   // 登录成功后跳转到首页
  //   Taro.switchTab({
  //     url: "/pages/home/index",
  //   });
  // };
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
          openType="getPhoneNumber"
          onGetPhoneNumber={(x) => {
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
