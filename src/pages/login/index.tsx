import { Button, Text, View } from "@tarojs/components";
// import { FC } from "react";
import style from "./index.module.scss";
import Taro from "@tarojs/taro";

const Login = () => {
  const getUserProfile = () => {
    Taro.showModal({
      title: "用户协议和隐私政策",
      content:
        "在使用梦寻小程序前，请务必仔细阅读并同意《用户协议》和《隐私政策》",
      confirmText: "同意",
      cancelText: "不同意",
      success: (res) => {
        if (res.confirm) {
          // 用户同意，继续获取用户信息
          Taro.getUserProfile({
            desc: "用于完善会员资料",
            success: (userRes) => {
              const code = Taro.getStorageSync("code");

              // 调用后端登录接口
              Taro.request({
                url: "http://127.0.0.1:8080/myapp/wx/login",
                method: "POST",
                header: {
                  "content-type": "application/json",
                },
                data: {
                  code: code,
                  userInfo: userRes.userInfo,
                },
                success: (result) => {
                  if (result.data) {
                    // 保存用户信息和token
                    Taro.setStorageSync("userInfo", userRes.userInfo);
                    Taro.setStorageSync("token", result.data);

                    // 登录成功后跳转到首页
                    Taro.switchTab({
                      url: "/pages/index/index",
                    });
                  } else {
                    Taro.showToast({
                      title: "登录失败",
                      icon: "none",
                    });
                  }
                },
                fail: (err) => {
                  console.error("Login failed:", err);
                  Taro.showToast({
                    title: "登录失败，请重试",
                    icon: "none",
                  });
                },
              });
            },
            fail: (err) => {
              console.error("getUserProfile fail:", err);
              Taro.showToast({
                title: "授权失败",
                icon: "none",
              });
            },
          });
        } else {
          // 用户不同意
          Taro.showToast({
            title: "需要同意协议才能继续使用",
            icon: "none",
          });
        }
      },
    });
  };
  const showUserAgreement = () => {};
  const showPrivacyPolicy = () => {};

  return (
    <View className={style.container}>
      <View className={style["login-box"]}>
        <image
          className={style.logo}
          src="/assets/images/login/login_banner.png"
          mode="aspectFit"
        ></image>
        <View className={style.title}>欢迎使用梦寻</View>
        <View className={style.desc}>请授权登录以使用完整功能</View>
        <Button
          className={style["login-btn"]}
          onClick={getUserProfile}
          type="primary"
          hover-className="button-hover"
        >
          微信一键登录
        </Button>
        <View className={style["privacy-policy"]}>
          登录即代表您同意
          <Text className={style.link} onClick={showUserAgreement}>
            《用户协议》
          </Text>
          和
          <Text className={style.link} onClick={showPrivacyPolicy}>
            《隐私政策》
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Login;
