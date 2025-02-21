export default defineAppConfig({
  pages: [
    "pages/home/index",
    "pages/index/index",
    "pages/record/record",
    "pages/analysis/analysis",
    "pages/profile/profile",
    "pages/auth/auth",
    "pages/login/login",
    "pages/agreement/agreement",
    "pages/privacy/privacy"],
  window: {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#971FCF",
    "navigationBarTitleText": "梦寻",
    "navigationBarTextStyle": "white"
  },
  tabBar: {
    color: "#999999",
    "selectedColor": "#971FCF",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/home/index",
        "text": "Dream",
        "iconPath": "assets/tabbar/dream.png",
        "selectedIconPath": "assets/tabbar/dream_selected.png"
      },
      {
        "pagePath": "pages/record/record",
        "text": "记录",
        "iconPath": "assets/tabbar/record.png",
        "selectedIconPath": "assets/tabbar/record_selected.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的",
        "iconPath": "assets/tabbar/profile.png",
        "selectedIconPath": "assets/tabbar/profile_selected.png"
      }
    ]
  },
});
