import { useRef, useState } from "react";
import Taro from "@tarojs/taro";
import { Button, Image, Radio, Text, View } from "@tarojs/components";
import { useLoginStore } from "@/store/loginStore";
import { AgreementPageType } from "../agreement/data";
import style from "./index.module.scss";

const Login = () => {
  const LoginBanner = 'https://aloss-qinghua-image.oss-cn-shanghai.aliyuncs.com/images/login_banner.png'
  const login = useLoginStore((state) => state.login);
  const [confirm, setConfirm] = useState(false)
  const logining = useRef(false)
  const handleLogin = async () => {
    if (logining.current) return
    if (!confirm) {
      const result = await Taro.showModal({
        title: '提示',
        content: '请先同意用户协议和隐私政策',
        showCancel: true
      })
      if (result.confirm) {
        setConfirm(true)
      } else {
        return
      }
    }
    logining.current = true
    Taro.showLoading({
      title: '登录中'
    })
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
    Taro.hideLoading()
    logining.current = false
  };
  const showUserAgreement = (pageType: string) => {
    Taro.navigateTo({
      url: `/pages/sub/agreement/index?pageType=${pageType}`,
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
         <View onClick={() => setConfirm(prev => !prev)}>
         <Radio 
           checked={confirm} 
           color='#971fcf'
           className={style['user-confirm']}
         ></Radio>
         </View>
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
