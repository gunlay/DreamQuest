import tabbarList from "./Components/Tabbar/tabbarList";

export default defineAppConfig({
  pages: [
    /** 主包开始位置 */
    "pages/home/index",
    "pages/record/index",
    "pages/profile/index",
    /** 主包结束位置 */
    /** 子包开始位置 */
    "pages/agreement/index",
    "pages/login/index",
    "pages/analysis/index",
    /** 子包结束位置 */
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
