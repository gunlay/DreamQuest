export default defineAppConfig({
  pages: [
    /** 主包开始位置 */
    "pages/home/index",
    "pages/record/index",
    "pages/profile/index",
    /** 主包结束位置 */
    /** 子包开始位置 */
    // "pages/analysis/analysis",
    // "pages/auth/auth",
    "pages/agreement/index",
    "pages/login/index",
    /** 子包结束位置 */
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#971FCF",
    navigationBarTitleText: "梦寻",
    navigationBarTextStyle: "white",
  },
  tabBar: {
    color: "#999999",
    selectedColor: "#971FCF",
    backgroundColor: "#ffffff",
    list: [
      {
        pagePath: "pages/home/index",
        text: "Dream",
        iconPath: "assets/image/tabbar/dream.png",
        selectedIconPath: "assets/image/tabbar/dream_selected.png",
      },
      {
        pagePath: "pages/record/index",
        text: "记录",
        iconPath: "assets/image/tabbar/record.png",
        selectedIconPath: "assets/image/tabbar/record_selected.png",
      },
      {
        pagePath: "pages/profile/index",
        text: "我的",
        iconPath: "assets/image/tabbar/profile.png",
        selectedIconPath: "assets/image/tabbar/profile_selected.png",
      },
    ],
  },
});
