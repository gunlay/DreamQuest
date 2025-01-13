interface Message {
  type: 'ai' | 'user';
  content: string;
}

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    dreamData: {
      type: Object,
      value: {}
    }
  },

  data: {
    messages: [] as Message[]
  },

  observers: {
    'visible': function(visible) {
      if (visible && this.data.dreamData) {
        // 当浮层显示且有梦境数据时，开始分析
        this.startAnalysis()
      }
    }
  },

  methods: {
    startAnalysis() {
      // TODO: 调用AI接口进行分析
      // 这里先模拟一些消息
      setTimeout(() => {
        this.addMessage('ai', '我注意到你的梦境中包含了一些有趣的元素...')
      }, 1000)
    },

    addMessage(type: 'ai' | 'user', content: string) {
      const messages = [...this.data.messages]
      messages.push({ type, content })
      this.setData({ messages })
    },

    // 点击遮罩关闭
    onModalTap() {
      this.triggerEvent('close')
    },

    // 阻止冒泡
    onContentTap(e: any) {
      e.stopPropagation()
    }
  }
}) 