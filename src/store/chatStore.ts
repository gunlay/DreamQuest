import { create } from 'zustand';
import { chatApi } from '@/api/chat';
import { ChatHistoryDTO, MessageDTO, NewMessageDTO } from '@/api/types/chat';
import { SSEOptions } from '@/api/types/sse';
import { useReportStore } from './report';

export interface ChatState {
  chatId: string;
  messages: MessageDTO[];
  dreamData: ChatHistoryDTO | null;
}

let timeoutId: NodeJS.Timeout | null = null;

interface ChatStoreState {
  dreamInput: NewMessageDTO | null;
  chatStates: Map<string, ChatState>;
  activeRequests: number;
  maxActiveRequests: number;
  getChatState: (chatId: string) => ChatState | undefined;
  setChatState: (chatId: string, state: Partial<ChatState>) => void;
  addMessage: (chatId: string, sender: 'ai' | 'user', message: string, chatting?: boolean) => void;
  sendMessage: (props: { chatId: string; message: string; sse: SSEOptions }) => Promise<void>;
  initChat: (chatId: string, callbacks?: SSEOptions) => Promise<string>;
  clearChat: (chatId: string) => void;
  setDreamInput: (params: NewMessageDTO) => void;
  clearDreamInput: () => void;
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
    console.log('addMessage', state);

    if (!state) {
      get().setChatState(chatId, {
        chatId,
        dreamData: get().dreamInput as ChatHistoryDTO,
        messages: [{ sender, message, chatting }],
      });
      return;
    }

    const updatedMessages = [...state.messages];
    if (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1].chatting) {
      updatedMessages[updatedMessages.length - 1] = {
        ...updatedMessages[updatedMessages.length - 1],
        chatting: false,
        message,
      };
    } else {
      updatedMessages.push({ sender, message, chatting });
    }

    get().setChatState(chatId, { messages: updatedMessages });
  },

  sendMessage: async ({ chatId, message, sse }) => {
    const { activeRequests, maxActiveRequests, addMessage, setChatState, getChatState } = get();

    if (activeRequests >= maxActiveRequests) {
      throw new Error('已达到最大并发请求数');
    }

    set({ activeRequests: activeRequests + 1 });
    addMessage(chatId, 'user', message);
    addMessage(chatId, 'ai', '', true);

    try {
      sse.startStream?.(chatId);
      chatApi.sendMessageStream(
        { chatId, message: message.trim(), sender: 'user' },
        {
          ...sse,
          onComplete: (result: string[]) => {
            sse.onComplete?.(result);
            set({ activeRequests: get().activeRequests - 1 });
          },
        }
      );
    } catch (error) {
      const state = getChatState(chatId);
      if (state) {
        const messages = state.messages.filter((msg) => !msg.chatting);
        setChatState(chatId, { messages });
      }
      throw error;
    }
  },

  initChat: async (chatId: string, sse: SSEOptions): Promise<string> => {
    const {
      dreamInput,
      activeRequests,
      getChatState,
      setChatState,
      clearDreamInput,
      addMessage,
      setDreamInput,
    } = get();
    set({ activeRequests: activeRequests + 1 });
    try {
      let finalChatId = chatId;
      if (!chatId && dreamInput) {
        // 创建新的
        const { chatId: newId } = await chatApi.createChatNew(dreamInput);
        addMessage(newId, 'ai', '', true);
        sse?.startStream?.(newId);
        chatApi.getAIstream(
          { content: dreamInput.message },
          {
            ...sse,
            onComplete: (result: string[]) => {
              sse.onComplete?.(result);
              set({ activeRequests: get().activeRequests - 1 });
            },
          }
        );

        useReportStore.getState().createNew();
        clearDreamInput();
        finalChatId = newId;
        const date1 = +new Date();
        timeoutId = setInterval(async () => {
          const date2 = +new Date();
          if (date2 - date1 > 15000) {
            clearInterval(timeoutId as NodeJS.Timeout);
            timeoutId = null;
            setDreamInput({
              ...dreamInput,
              imageAndTagsLoaded: true,
            });
            return;
          }
          const result = await chatApi.fetchChatHistory({ chatId: finalChatId });
          if (result.image && result.tags?.length) {
            setChatState(finalChatId, {
              chatId: finalChatId,
              dreamData: result,
            });
            setDreamInput({
              ...dreamInput,
              imageAndTagsLoaded: true,
            });
            clearInterval(timeoutId as NodeJS.Timeout);
            timeoutId = null;
          }
        }, 3000);
      } else {
        const state = getChatState(finalChatId);
        console.log('state', state);

        // 如果最后一条消息是正在聊天的消息，就不请求接口
        if (state?.messages?.length && state.messages[state.messages.length - 1].chatting) {
          setChatState(finalChatId, {
            chatId: finalChatId,
            dreamData: { ...state.dreamData, imageAndTagsLoaded: true } as ChatHistoryDTO,
            messages: state?.messages,
          });
        } else {
          // 请求接口
          const result = await chatApi.fetchChatHistory({ chatId: finalChatId });
          setChatState(finalChatId, {
            chatId: finalChatId,
            dreamData: { ...result, imageAndTagsLoaded: true },
            messages: result.messages,
          });
          set({ activeRequests: get().activeRequests - 1 });
        }
      }

      return finalChatId;
    } finally {
    }
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
