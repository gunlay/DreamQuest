// pages/auth/auth.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    hasUserInfo: false
  },

  // 授权按钮点击事件
  onGetUserInfo(e: { detail: { userInfo: any; }; }) {
    if (e.detail.userInfo) {
      // 用户同意授权，保存用户信息
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      });

      // 跳转到首页或其他页面
      wx.navigateTo({
        url: '/pages/index/index'  // 授权后跳转到首页
      });
    } else {
      // 用户拒绝授权，提示用户授权
      wx.showModal({
        title: '授权提示',
        content: '为了更好的使用本小程序，请授权获取用户信息。',
        showCancel: false,
        confirmText: '确定',
        success(res) {
          if (res.confirm) {
            // 可以提供其他操作，如跳转到其他页面或继续授权
          }
        }
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})