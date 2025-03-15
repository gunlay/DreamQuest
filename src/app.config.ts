import tabbarList from "./Components/Tabbar/tabbarList";

export default defineAppConfig({
  pages: [
    "pages/home/index",
    "pages/record/index",
    "pages/profile/index"
  ],
  subpackages: [
    {
      root: "pages/sub",
      pages: [
        "agreement/index",
        "login/index",
        "analysis/index"
      ]
    }
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#971FCF",
    navigationBarTitleText: "梦寻",
    navigationBarTextStyle: "white",
  },
  tabBar: {
    custom: true,
    color: "#999999",
    selectedColor: "#971FCF",
    backgroundColor: "#ffffff",
    list: tabbarList,
  },
});
