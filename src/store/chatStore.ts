import { create } from "zustand";
import { chatApi } from "@/api/chat";
import { ChatHistoryDTO, MessageDTO, NewMessageDTO } from "@/api/types/chat";

interface ChatState {
  chatId: string;
  messages: MessageDTO[];
  dreamData: ChatHistoryDTO | null;
}

interface ChatStoreState {
  dreamInput: NewMessageDTO | null;
  chatStates: Map<string, ChatState>;
  activeRequests: number;
  maxActiveRequests: number;
  getChatState: (chatId: string) => ChatState | undefined;
  setChatState: (chatId: string, state: Partial<ChatState>) => void;
  addMessage: (chatId: string, sender: 'ai' | 'user', message: string, chatting?: boolean) => void;
  sendMessage: (chatId: string, message: string) => Promise<void>;
  initChat: (chatId: string) => Promise<string>;
  clearChat: (chatId: string) => void;
  setDreamInput: (params: NewMessageDTO) => void
  clearDreamInput: () => void
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  dreamInput: null,
  chatStates: new Map<string, ChatState>(),
  activeRequests: 0,
  maxActiveRequests: 3,

  getChatState: (chatId: string) => {
    return get().chatStates.get(chatId);
  },

  setChatState: (chatId: string, state: Partial<ChatState>) => {
    const chatStates = get().chatStates;
    const currentState = chatStates.get(chatId) || {
      chatId,
      messages: [],
      dreamData: null,
    };
    chatStates.set(chatId, { ...currentState, ...state });
    set({ chatStates: new Map(chatStates) });
  },

  addMessage: (chatId: string, sender: 'ai' | 'user', message: string, chatting = false) => {
    const state = get().getChatState(chatId);
    if (!state) return;

    const updatedMessages = [...state.messages];
    if (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1].chatting) {
      updatedMessages[updatedMessages.length - 1] = {
        ...updatedMessages[updatedMessages.length - 1],
        chatting: false,
        message
      };
    } else {
      updatedMessages.push({ sender, message, chatting });
    }

    get().setChatState(chatId, { messages: updatedMessages });
  },

  sendMessage: async (chatId: string, message: string) => {
    const { activeRequests, maxActiveRequests, addMessage, setChatState, getChatState } = get();
    
    if (activeRequests >= maxActiveRequests) {
      throw new Error('已达到最大并发请求数');
    }

    set({ activeRequests: activeRequests + 1 });
    addMessage(chatId, 'user', message);
    addMessage(chatId, 'ai', '', true);

    try {
      const data = await chatApi.sendMessages({ chatId, message: message.trim(), sender: 'user' });
      addMessage(chatId, 'ai', data);
    } catch (error) {
      const state = getChatState(chatId);
      if (state) {
        const messages = state.messages.filter(msg => !msg.chatting);
        setChatState(chatId, { messages });
      }
      throw error;
    } finally {
      set({ activeRequests: get().activeRequests - 1 });
    }
  },

  initChat: async (chatId: string): Promise<string> => {
    const { 
      dreamInput, activeRequests, getChatState, setChatState, clearDreamInput 
    } = get();
    // if (activeRequests >= maxActiveRequests) {
    //   throw new Error('已达到最大并发请求数');
    // }

    set({ activeRequests: activeRequests + 1 });
    try {
      let finalChatId = chatId;
      if (!chatId && dreamInput) {
        const { chatId: newId } = await chatApi.createNewChat(dreamInput);
        clearDreamInput()
        finalChatId = newId;
      } else if (!chatId && !dreamInput) {
        return ''
      }
      const state = getChatState(finalChatId);
      // 如果最后一条消息是正在聊天的消息，就不请求接口
      if (state?.messages?.length && state.messages[state.messages.length - 1].chatting) {
        setChatState(finalChatId, {
          chatId: finalChatId,
          dreamData: state.dreamData,
          messages: state?.messages
        })
      } else {
        // 请求接口
        const result = await chatApi.fetchChatHistory({ chatId: finalChatId });
        setChatState(finalChatId, {
          chatId: finalChatId,
          dreamData: result,
          messages: result.messages || [],
        });
        set({ activeRequests: get().activeRequests - 1 });
      }
      return finalChatId;
    } finally {}
  },

  clearChat: (chatId: string) => {
    const chatStates = get().chatStates;
    chatStates.delete(chatId);
    set({ chatStates: new Map(chatStates) });
  },
  setDreamInput: (params: NewMessageDTO) => {
    set({ dreamInput: params });
  },
  clearDreamInput: () => {
    set({ dreamInput: null });
  },
}));