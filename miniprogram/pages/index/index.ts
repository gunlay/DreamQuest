// index.ts
// 获取应用实例
const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

import { getWeeklyDreams, generateWeeklyReportContent } from '../../services/weeklyReport.service'

interface WeeklyReport {
  keywords: string;
  analysis: string;
  emotionTrend: string;
  aiSuggestion: string;
}

Component({
  data: {
    app,
    dateInfo: {
      date: '2024.12.24',
      weekday: '周二'
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
      keywords: '开始记录你的第一个梦境吧',
      analysis: '开始记录梦境是了解自己内心世界的第一步。每个梦境都是独特的，都值得被记录和理解。',
      emotionTrend: '开始记录梦境，探索内心情感的变化。',
      aiSuggestion: '建议在睡醒后第一时间记录梦境，这样能记住更多细节。可以从印象最深刻的片段开始写起，慢慢培养记录习惯。'
    } as WeeklyReport,
    isReportExpanded: false,
    showDreamInput: false,
    isGeneratingReport: false
  },

  lifetimes: {
    attached() {

      this.updateDateInfo()
      this.fetchDreamTheory()
      this.fetchWeeklyReport()
      
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
          weekday: `周${weekdays[now.getDay()]}`
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

    async fetchWeeklyReport() {
      console.log('开始生成周报...');
      this.setData({ isGeneratingReport: true });
      
      try {
        // 获取最近一周的梦境数据
        console.log('获取最近一周的梦境数据...');
        const weeklyDreams = getWeeklyDreams();
        console.log('获取到的梦境数据:', weeklyDreams);
        
        if (weeklyDreams.length === 0) {
          console.log('没有梦境记录，使用默认值');
          this.setData({ 
            weeklyReport: {
              keywords: '开始记录你的第一个梦境吧',
              analysis: '开始记录梦境是了解自己内心世界的第一步。每个梦境都是独特的，都值得被记录和理解。',
              emotionTrend: '开始记录梦境，探索内心情感的变化。',
              aiSuggestion: '建议在睡醒后第一时间记录梦境，这样能记住更多细节。可以从印象最深刻的片段开始写起，慢慢培养记录习惯。'
            } as WeeklyReport,
            isGeneratingReport: false
          });
          return;
        }
        
        // 生成周报内容
        console.log('开始生成周报内容...');
        const reportContent = await generateWeeklyReportContent(weeklyDreams);
        console.log('生成的周报内容:', reportContent);
        
        // 更新UI
        wx.nextTick(() => {
          this.setData({
            weeklyReport: reportContent,
            isGeneratingReport: false
          });
          console.log('周报生成完成，UI已更新');
        });
      } catch (error) {
        console.error('获取周报失败:', error);
        wx.nextTick(() => {
          this.setData({ 
            isGeneratingReport: false,
            weeklyReport: {
              keywords: '开始记录你的第一个梦境吧',
              analysis: '开始记录梦境是了解自己内心世界的第一步。每个梦境都是独特的，都值得被记录和理解。',
              emotionTrend: '开始记录梦境，探索内心情感的变化。',
              aiSuggestion: '建议在睡醒后第一时间记录梦境，这样能记住更多细节。可以从印象最深刻的片段开始写起，慢慢培养记录习惯。'
            } as WeeklyReport
          });
        });
        wx.showToast({
          title: '周报生成失败',
          icon: 'error'
        });
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
      
      // 获取现有的梦境记录
      const existingDreams = wx.getStorageSync('dreams') || [];
      console.log('现有的梦境记录:', existingDreams);
      
      // 添加新的梦境记录
      const updatedDreams = [dreamData, ...existingDreams];
      console.log('更新后的梦境记录:', updatedDreams);
      
      // 保存到本地存储
      wx.setStorageSync('dreams', updatedDreams);
      console.log('梦境记录已保存到本地存储');
      
      // 关闭输入浮层
      this.hideDreamInput()
      
      // 更新周报
      this.fetchWeeklyReport()
      
      // 跳转到分析页面
      wx.navigateTo({
        url: '/pages/analysis/analysis'
      })
    }
  }
})
