// app.ts

// 在文件顶部添加以下接口定义
interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    isLoggedIn: boolean
  }
  getUserInfo: () => void
  requestAuthorization: () => void
  checkSession: () => void
  saveUserInfo: (token: string, userInfo: WechatMiniprogram.UserInfo) => void
  wxLogin: () => void
  checkUserAuth: () => void
}

App<IAppOption>({
  globalData: {
    isLoggedIn: false
  },
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-1g7r08a7680be2eb',
        traceUser: true
      })
    }

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 检查登录状态
    this.checkSession()
  },

  // 微信登录获取 code
  wxLogin() {
    wx.login({
      success: res => {
        wx.setStorageSync('code', res.code)
        // 跳转到登录页面
        wx.navigateTo({
          url: '/pages/login/login'
        })
      },
      fail: () => {
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        })
      }
    })
  },

  // 获取用户信息的函数
  getUserInfo() {
    // 由于无法直接获取用户信息，改为检查是否有存储的用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      const token = wx.getStorageSync('token')
      this.saveUserInfo(token, userInfo)
    } else {
      // 没有用户信息，跳转到登录页面
      this.requestAuthorization()
    }
  },

  // 请求授权的函数
  requestAuthorization() {
    // 不再使用 wx.authorize，而是跳转到登录页面
    wx.navigateTo({
      url: '/pages/login/login' // 跳转到登录页面
    })
  },

  // 保存用户信息的函数
  saveUserInfo(token: string, userInfo: WechatMiniprogram.UserInfo) {
    if (!token) {
      console.error('Token is missing')
      wx.showToast({
        title: '登录信息缺失，请重新登录',
        icon: 'none'
      })
      return
    }

    wx.request({
      url: 'http://localhost:8080/myapp/wx/saveUserInfo',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: {
        token: token,
        nickname: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        gender: userInfo.gender,
        province: userInfo.province,
        city: userInfo.city,
        country: userInfo.country
      },
      success: result => {        
        if (result.data) {
          wx.setStorageSync('token', result.data)
          // 修改为 switchTab，因为 index 是 tabBar 页面
          wx.switchTab({
            url: '/pages/index/index',
          })
          wx.setStorageSync('userInfo', result.data)
        } else {
          wx.showToast({
            title: '登录失败',
            icon: 'none',
          })
        }
      },
      fail: err => {
        console.error('saveUserInfo request fail:', err)
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
        })
      }
    })
  },
  checkSession() {
    const token = wx.getStorageSync('token')    
    if (!token) {
      this.globalData.isLoggedIn = false
      return false
    } else {
      this.globalData.isLoggedIn = true
      return true
    }

    // wx.checkSession({
    //   success: () => {        
    //     // session_key 未过期
        
    //     this.globalData.isLoggedIn = true
    //     return true
    //   },
    //   fail: () => {    
    //     // session_key 已过期
    //     this.globalData.isLoggedIn = false
    //     wx.removeStorageSync('token')
    //     wx.removeStorageSync('userInfo')
    //     return false
    //   }
    // })
  },
  checkUserAuth() {
    return this.globalData.isLoggedIn
  }
})