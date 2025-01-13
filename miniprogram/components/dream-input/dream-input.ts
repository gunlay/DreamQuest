import { generateDreamImage } from '../../services/dreamImage.service'

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    title: '',
    content: '',
    currentDate: '',
    canSave: false,
    isGeneratingImage: false
  },

  lifetimes: {
    attached() {
      // 设置当前日期
      const now = new Date()
      const date = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`
      this.setData({ currentDate: date })
    }
  },

  observers: {
    'title, content': function(title: string, content: string) {
      // 当标题和内容都有值时才能保存
      this.setData({
        canSave: !!(title.trim() && content.trim())
      })
    }
  },

  methods: {
    onTitleInput(e: any) {
      this.setData({ title: e.detail.value })
    },

    onContentInput(e: any) {
      this.setData({ content: e.detail.value })
    },

    async onSave() {
      if (!this.data.canSave) {
        console.warn('无法保存：标题或内容为空')
        return
      }

      const { title, content, currentDate } = this.data
      console.warn('\n=== 开始保存梦境记录 ===')
      console.warn('标题:', title)
      console.warn('内容:', content)
      console.warn('日期:', currentDate)
      
      // 显示加载状态
      this.setData({ isGeneratingImage: true })
      wx.showLoading({
        title: '正在生成图片...',
        mask: true
      })

      let dreamData = {
        id: Date.now(),
        title: title.trim(),
        content: content.trim(),
        date: currentDate,
        weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(currentDate.replace(/\./g, '-')).getDay()],
        image: '/assets/images/default_dream.png'  // 默认图片
      }

      try {
        console.warn('\n开始生成图片...')
        // 生成图片
        const imageUrl = await generateDreamImage(content.trim())
        console.warn('图片生成成功:', imageUrl)
        dreamData.image = imageUrl
      } catch (error) {
        console.error('\n图片生成失败:', error)
        wx.showToast({
          title: '图片生成失败',
          icon: 'error',
          duration: 2000
        })
      } finally {
        // 无论图片生成是否成功，都保存数据并跳转
        console.warn('\n准备保存的数据:', JSON.stringify(dreamData, null, 2))
        
        // 保存到本地存储
        wx.setStorageSync('currentDream', dreamData)
        
        // 触发保存事件
        this.triggerEvent('save', dreamData)
        
        // 清空输入
        this.setData({
          title: '',
          content: '',
          isGeneratingImage: false
        })

        // 隐藏加载状态
        wx.hideLoading()

        // 跳转到分析页面
        wx.navigateTo({
          url: '/pages/analysis/analysis',
          success: () => console.warn('成功跳转到分析页面'),
          fail: (error) => console.error('跳转失败:', error)
        })
      }
    },

    hideDreamInput() {
      this.triggerEvent('close')
    },

    stopPropagation() {
      // 阻止事件冒泡
    }
  }
}) 