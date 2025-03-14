interface Message {
  id: string | undefined;
  type: 'ai';
  content: string;
}

interface Dream {
  content: string;
  createTime: string;
}

interface CloudFunctionResult<T> {
  result: T;
  errMsg?: string;
}

Page({
  data: {
    inputMessage: '',
    messages: [] as Message[],
    lastMessageId: '',
    dreamCount: 0,
    mostDreamDay: ''
  },

  onLoad() {
    // this.loadDreamsAndAnalyze()
  },

  async loadDreamsAndAnalyze() {
    try {
      // 1. 获取最近20条梦境记录
      const dreamsResult = await wx.cloud.callFunction({
        name: 'getDreams',
        data: { limit: 20 }
      }) as CloudFunctionResult<{ data: Dream[] }>;

      if (!dreamsResult.result.data) {
        throw new Error('获取梦境记录失败');
      }

      const dreams = dreamsResult.result.data;

      // 2. 更新统计数据
      this.setData({
        dreamCount: dreams.length
      });

      // 3. 如果有梦境记录，调用大模型进行分析
      if (dreams.length > 0) {
        const dreamTexts = dreams.map(dream => dream.content).join('\n');
        
        // 调用大模型API
        const analysisResult = await wx.cloud.callFunction({
          name: 'analyzeDreams',
          data: { dreams: dreamTexts }
        }) as CloudFunctionResult<{ content: string }>;

        if (!analysisResult.result?.content) {
          throw new Error('分析结果格式错误');
        }

        // 4. 显示分析结果
        const aiMessage: Message = {
          id: `msg_${Date.now()}`,
          type: 'ai',
          content: analysisResult.result.content
        };

        this.setData({
          messages: [aiMessage],
          lastMessageId: aiMessage.id
        });
      } else {
        // 没有梦境记录时显示提示信息
        const aiMessage: Message = {
          id: `msg_${Date.now()}`,
          type: 'ai',
          content: '你还没有记录任何梦境哦，快去记录一下吧！'
        };

        this.setData({
          messages: [aiMessage],
          lastMessageId: aiMessage.id
        });
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      wx.showToast({
        title: error instanceof Error ? error.message : '分析失败，请稍后重试',
        icon: 'none'
      });
    }
  },

  onInputChange(e: any) {
    this.setData({
      inputMessage: e.detail.value
    });
  },

  sendMessage() {
    if (!this.data.inputMessage.trim()) return;
    
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: this.data.inputMessage
    };
    
    this.setData({
      messages: [...this.data.messages, newMessage],
      inputMessage: '',
      lastMessageId: newMessage.id
    });

    // 模拟AI回复
    setTimeout(() => {
      const aiMessage: Message = {
        id: `msg_${Date.now()}`,
        type: 'ai',
        content: '我理解你的梦境。这个梦可能反映了你内心的一些想法和情感。让我们一起深入探讨这个梦境的含义。'
      };
      
      this.setData({
        messages: [...this.data.messages, aiMessage],
        lastMessageId: aiMessage.id
      });
    }, 1000);
  }
});