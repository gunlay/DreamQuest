Page({
  data: {
    canIUseGetUserProfile: true,
    isAgreed: false
  },

  toggleAgreement() {
    this.setData({
      isAgreed: !this.data.isAgreed
    });
  },

  async getUserProfile() {
    if (!this.data.isAgreed) {
      wx.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none'
      });
      return 
    }
    const code = await wx.login();
        
    // 调用云函数进行登录
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'wxLogin',
        data: {
          code: code.code, 
        }
      });      
      if (result.code) {
        // 保存用户信息和token
        // wx.setStorageSync('userInfo', userRes.userInfo);
        wx.setStorageSync('token', result.code);
        
        // 更新全局登录状态
        const app = getApp<IAppOption>();
        app.globalData.isLoggedIn = true;
        app.checkSession();
        
        // 登录成功后跳转到首页
        wx.switchTab({
          url: '/pages/index/index'
        });
      } else {
        wx.showToast({
          title: result.message || '登录失败',
          icon: 'none'
        });
      }
    } catch (err) {
      console.error('Login failed:', err);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    }

    // wx.getUserProfile({
    //   desc: '用于完善会员资料',
    //   success: async (userRes) => {

    //   },
    //   fail: (err) => {
    //     console.error('getUserProfile fail:', err);
    //     wx.showToast({
    //       title: '授权失败',
    //       icon: 'none'
    //     });
    //   }
    // });
  },

  // 显示用户协议
  showUserAgreement() {
    wx.navigateTo({
      url: '/pages/agreement/agreement'
    });
  },

  // 显示隐私政策
  showPrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/privacy/privacy'
    });
  }
})