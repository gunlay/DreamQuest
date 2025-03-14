interface TabItem {
  pagePath: string;
  iconPath: string;
  selectedIconPath: string;
  text: string;
  requireLogin?: boolean;
}

interface IAppOption {
  globalData: {
    isLoggedIn: boolean;
  };
}

const app = getApp()

Component({
  lifetimes: {
    attached() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const currentPath = `/${currentPage.route}`;
      
      const index = this.data.list.findIndex(item => item.pagePath === currentPath);
      if (index !== -1) {
        this.setData({ selected: index });
      } 
      app.checkSession();      
    }
  },
  properties: {
    currentTab: {
      type: Number,
      value: 0,
      observer(newVal: number) {
        if (newVal !== this.data.selected) {
          this.setData({ selected: newVal });
        }
      }
    }
  },

  data: {
    app,
    selected: 0,
    color: "rgba(60, 60, 67, 0.6)",
    selectedColor: "#971FCF",
    list: [{
      pagePath: "/pages/index/index",
      iconPath: "/assets/tabbar/dream.png",
      selectedIconPath: "/assets/tabbar/dream_selected.png",
      text: "解梦"
    }, {
      pagePath: "/pages/record/record",
      iconPath: "/assets/tabbar/record.png",
      selectedIconPath: "/assets/tabbar/record_selected.png",
      text: "记录",
      requireLogin: true
    }, {
      pagePath: "/pages/profile/profile",
      iconPath: "/assets/tabbar/profile.png",
      selectedIconPath: "/assets/tabbar/profile_selected.png",
      text: "我的"
    }] as TabItem[]
  },

  methods: {
    switchTab(e: WechatMiniprogram.TouchEvent) {
      const data = e.currentTarget.dataset;
      const index = data.index as number;
      const item = this.data.list[index];
      const app = getApp<IAppOption>();      
      if (item.requireLogin && !app.globalData.isLoggedIn) {
        wx.navigateTo({
          url: '/pages/login/login'
        });
        return;
      }
      
      this.setData({
        selected: index
      });

      wx.switchTab({
        url: data.path
      });
    }
  }
});