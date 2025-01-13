// index.ts
// 获取应用实例
const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Component({
  data: {
    dateInfo: {
      date: '2024.12.24',
      weekday: '周二',
      lunar: '腊月廿四'
    },
    dreamTheory: {
      title: '弗洛伊德的梦境理论',
      content: '弗洛伊德认为，梦境是潜意识欲望和冲突的表现，尤其是那些被压抑的欲望。昨晚的梦，是不是某种未实现的渴望？'
    },
    hasSelectedZodiac: false,
    zodiacIndex: -1,
    zodiacs: ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', 
              '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'],
    isFortuneExpanded: false,
    fortune: {
      overall: '',
      career: '',
      love: '',
      money: '',
      health: '',
      luckyNumber: '',
      luckyColor: '',
      luckyDirection: ''
    },
    weeklyReport: {
      image: '',
      keywords: '本周你的梦境中出现最多的是【自由】【压力】【探索】，这些关键词可能与你近期的情绪或生活事件有关。',
      analysis: '重复出现的场景或人物，可能反映了你内心未解决的问题。梦中追逐或迷路的情节，或许是内心对方向感缺失的隐喻。如果梦里充满新奇事物，这可能是你潜意识在激发创造力。',
      emotionTrend: '本周梦境情绪呈现【波动】的特点，建议关注梦境带来的情绪变化，这会帮助你更好地了解自己的内心需求。',
      aiSuggestion: '试着记录梦中细节，特别是让你印象深刻的画面，或许能挖掘出潜藏的灵感或答案！'
    },
    isReportExpanded: false,
    showDreamInput: false
  },

  lifetimes: {
    attached() {
      this.updateDateInfo()
      this.fetchDreamTheory()
      
      // 获取保存的星座并更新运势
      const savedZodiac = wx.getStorageSync('userZodiac')
      if (savedZodiac) {
        const zodiacIndex = this.data.zodiacs.findIndex(z => z === savedZodiac)
        this.setData({ 
          zodiacIndex,
          hasSelectedZodiac: true
        })
        this.fetchFortune(savedZodiac)
      }
    }
  },

  methods: {
    updateDateInfo() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const weekdays = ['日', '一', '二', '三', '四', '五', '六']
      
      this.setData({
        dateInfo: {
          date: `${year}.${month}.${day}`,
          weekday: `周${weekdays[now.getDay()]}`,
          lunar: '腊月廿四'
        }
      })
    },

    async fetchDreamTheory() {
      this.setData({
        dreamTheory: {
          title: '弗洛伊德的梦境理论',
          content: '弗洛伊德认为，梦境是潜意识欲望和冲突的表现，尤其是那些被压抑的欲望。昨晚的梦，是不是某种未实现的渴望？'
        }
      })
    },

    handleZodiacChange(e: any) {
      const index = e.detail.value
      this.setData({ 
        zodiacIndex: index,
        hasSelectedZodiac: true,
        isFortuneExpanded: true
      })
      this.fetchFortune(this.data.zodiacs[index])
    },

    toggleFortune() {
      if (!this.data.hasSelectedZodiac) return
      
      this.setData({
        isFortuneExpanded: !this.data.isFortuneExpanded
      })
    },

    async fetchFortune(zodiac: string) {
      // 星座英文名映射
      const zodiacMap: { [key: string]: string } = {
        '白羊座': 'aries',
        '金牛座': 'taurus',
        '双子座': 'gemini',
        '巨蟹座': 'cancer',
        '狮子座': 'leo',
        '处女座': 'virgo',
        '天秤座': 'libra',
        '天蝎座': 'scorpio',
        '射手座': 'sagittarius',
        '摩羯座': 'capricorn',
        '水瓶座': 'aquarius',
        '双鱼座': 'pisces'
      }

      try {
        const zodiacEn = zodiacMap[zodiac]
        if (!zodiacEn) {
          throw new Error('无效的星座选择')
        }

        const result = await new Promise((resolve, reject) => {
          wx.request({
            url: 'https://api.vvhan.com/api/horoscope',
            method: 'GET',
            data: {
              type: zodiacEn,
              time: 'today'
            },
            success: (res: any) => {
              console.log('运势接口返回:', res.data) // 添加日志
              resolve(res)
            },
            fail: (err: any) => {
              console.error('运势接口错误:', err) // 添加日志
              reject(err)
            }
          })
        }) as WechatMiniprogram.RequestSuccessCallbackResult

        const data = result.data as any
        if (data && data.success) {
          // 保存用户的星座选择
          wx.setStorageSync('userZodiac', zodiac)
          
          this.setData({
            fortune: {
              overall: data.data.fortunetext.all || '',
              career: data.data.fortunetext.work || '',
              love: data.data.fortunetext.love || '',
              money: data.data.fortunetext.money || '',
              health: data.data.fortunetext.health || '',
              luckyNumber: data.data.luckynumber || '',
              luckyColor: data.data.luckycolor || '',
              luckyDirection: data.data.luckyconstellation || '' // 修改为幸运星座
            },
            hasSelectedZodiac: true
          })
        } else {
          throw new Error('接口返回数据格式错误')
        }
      } catch (error) {
        console.error('获取运势失败:', error)
        wx.showToast({
          title: '获取运势失败',
          icon: 'error'
        })
      }
    },

    toggleReport() {
      this.setData({
        isReportExpanded: !this.data.isReportExpanded
      })
    },

    showDreamInput() {
      this.setData({ showDreamInput: true })
    },

    hideDreamInput() {
      this.setData({ showDreamInput: false })
    },

    onDreamSave(e: any) {
      const dreamData = {
        ...e.detail,
        id: Date.now() // 添加唯一ID
      }
      
      // 保存梦境数据到本地存储
      wx.setStorageSync('currentDream', dreamData)
      
      // 关闭输入浮层
      this.hideDreamInput()
      
      // 跳转到分析页面
      wx.navigateTo({
        url: '/pages/analysis/analysis'
      })
    }
  }
})
