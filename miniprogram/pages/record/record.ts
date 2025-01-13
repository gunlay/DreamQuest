interface CalendarDay {
  day: string | number;
  date: string;
  isToday?: boolean;
  isSelected?: boolean;
  hasPositiveDream?: boolean;
  hasNegativeDream?: boolean;
}

interface DreamRecord {
  id: number;
  title: string;
  date: string;
  weekday: string;
  image: string;
  content: string;
  tags: string[];
  emotion?: 'positive' | 'negative';
}

interface MonthDreams {
  month: string;
  dreams: DreamRecord[];
}

interface PageData {
  currentTab: string;
  searchKeyword: string;
  weekdays: string[];
  currentYear: number;
  currentMonth: number;
  calendarDays: CalendarDay[][];
  selectedDate: string;
  selectedDateDreams: DreamRecord[];
  dreamList: MonthDreams[];
  originalDreamList?: MonthDreams[];
}

Page({
  data: {
    currentTab: 'list',
    searchKeyword: '',
    weekdays: ['一', '二', '三', '四', '五', '六', '日'],
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    calendarDays: [] as CalendarDay[][],
    selectedDate: '',
    selectedDateDreams: [] as DreamRecord[],
    dreamList: [] as MonthDreams[],
    originalDreamList: [] as MonthDreams[]
  } as PageData,

  onLoad() {
    this.initCalendar()
  },

  onShow() {
    // 每次页面显示时重新加载数据
    this.loadDreams()
  },

  loadDreams() {
    // 从本地存储获取梦境记录
    const dreams = wx.getStorageSync('dreams') || []
    
    // 按月份分组
    const groupedDreams = this.groupDreamsByMonth(dreams)
    
    this.setData({
      dreamList: groupedDreams,
      originalDreamList: groupedDreams
    })

    // 如果在日历视图，更新日历数据
    if (this.data.currentTab === 'calendar') {
      this.generateCalendarDays()
    }
  },

  groupDreamsByMonth(dreams: DreamRecord[]): MonthDreams[] {
    const grouped: { [key: string]: DreamRecord[] } = {}
    
    dreams.forEach(dream => {
      const month = dream.date.split('.')[1] // 获取日期中的月份
      if (!grouped[month]) {
        grouped[month] = []
      }
      grouped[month].push(dream)
    })
    
    return Object.keys(grouped)
      .sort((a, b) => Number(b) - Number(a)) // 按月份倒序排序
      .map(month => ({
        month,
        dreams: grouped[month]
      }))
  },

  viewDreamDetail(e: any) {
    const dreamId = e.currentTarget.dataset.id
    // 从本地存储获取完整的梦境数据
    const dreams = wx.getStorageSync('dreams') || []
    const dreamData = dreams.find((dream: DreamRecord) => dream.id === dreamId)
    
    if (dreamData) {
      // 保存当前梦境数据到本地存储
      wx.setStorageSync('currentDream', dreamData)
      
      // 跳转到详情页
      wx.navigateTo({
        url: '/pages/analysis/analysis'
      })
    }
  },

  // 日历相关功能
  initCalendar() {
    const today = new Date()
    this.setData({
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth() + 1,
      selectedDate: this.formatDate(today)
    })
    this.generateCalendarDays()
  },

  generateCalendarDays() {
    const { currentYear, currentMonth } = this.data
    const firstDay = new Date(currentYear, currentMonth - 1, 1)
    const lastDay = new Date(currentYear, currentMonth, 0)
    
    let firstDayWeek = firstDay.getDay() // 获取每月1号是星期几（0是星期日）
    firstDayWeek = firstDayWeek === 0 ? 6 : firstDayWeek - 1 // 调整为星期一为0，星期日为6
    
    const totalDays = lastDay.getDate()
    const rows = Math.ceil((totalDays + firstDayWeek) / 7)
    const calendarDays: CalendarDay[][] = []

    let date = 1
    const today = this.formatDate(new Date())

    for (let i = 0; i < rows; i++) {
      const row: CalendarDay[] = []
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayWeek) {
          row.push({ day: '', date: '' })
        } else if (date > totalDays) {
          row.push({ day: '', date: '' })
        } else {
          const currentDate = this.formatDate(new Date(currentYear, currentMonth - 1, date))
          const dreamInfo = this.getDreamInfo(currentDate)
          row.push({
            day: date,
            date: currentDate,
            isToday: currentDate === today,
            isSelected: currentDate === this.data.selectedDate,
            hasPositiveDream: dreamInfo.hasPositive,
            hasNegativeDream: dreamInfo.hasNegative
          })
          date++
        }
      }
      calendarDays.push(row)
    }

    this.setData({ calendarDays })
    this.updateSelectedDateDreams()
  },

  formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  },

  getDreamInfo(date: string) {
    const dreams = wx.getStorageSync('dreams') || []
    const dayDreams = dreams.filter((dream: DreamRecord) => dream.date === date)
    return {
      hasPositive: dayDreams.some(dream => dream.emotion === 'positive'),
      hasNegative: dayDreams.some(dream => dream.emotion === 'negative')
    }
  },

  updateSelectedDateDreams() {
    const dreams = wx.getStorageSync('dreams') || []
    const selectedDateDreams = dreams.filter(
      (dream: DreamRecord) => dream.date === this.data.selectedDate
    )
    this.setData({ selectedDateDreams })
  },

  onDatePickerChange(e: any) {
    const dateStr = e.detail.value as string
    const [year, month] = dateStr.split('-').map(Number)
    this.setData({
      currentYear: year,
      currentMonth: month
    })
    this.generateCalendarDays()
  },

  selectDate(e: any) {
    const date = e.currentTarget.dataset.date
    if (!date) return
    
    this.setData({ selectedDate: date })
    this.generateCalendarDays()
  },

  switchTab(e: any) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
    
    if (tab === 'calendar') {
      this.initCalendar()
    }
  },

  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 1) {
      currentMonth = 12;
      currentYear -= 1;
    } else {
      currentMonth -= 1;
    }
    this.setData({ currentYear, currentMonth });
    this.generateCalendarDays();
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 12) {
      currentMonth = 1;
      currentYear += 1;
    } else {
      currentMonth += 1;
    }
    this.setData({ currentYear, currentMonth });
    this.generateCalendarDays();
  }
}) 