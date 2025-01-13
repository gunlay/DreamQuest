interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
}

Page({
  data: {
    inputMessage: '',
    messages: [] as Message[],
    lastMessageId: ''
  },

  onLoad() {
    // 添加初始AI消息
    const initialMessage: Message = {
      id: `msg_${Date.now()}`,
      type: 'ai',
      content: '我理解你的梦境。这个梦可能反映了你内心的一些想法和情感。让我们一起深入探讨这个梦境的含义。'
    };
    
    this.setData({
      messages: [initialMessage],
      lastMessageId: initialMessage.id
    });
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