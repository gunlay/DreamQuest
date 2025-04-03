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
  initChat: (chatId: string, newCreate?: boolean, callbacks?: SSEOptions) => Promise<void>;
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
        sender,
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

  initChat: async (chatId: string, newCreate = false, sse: SSEOptions): Promise<void> => {
    const { dreamInput, activeRequests, getChatState, setChatState, clearDreamInput, addMessage } =
      get();
    set({ activeRequests: activeRequests + 1 });
    try {
      const state = getChatState(chatId);
      if (newCreate && dreamInput) {
        // 创建新的
        addMessage(chatId, 'ai', '', true);
        sse?.startStream?.(chatId);
        chatApi.getAIstream(
          { content: dreamInput?.message || '' },
          {
            ...sse,
            onComplete: (result: string[]) => {
              sse.onComplete?.(result);
              if (!getChatState(chatId)?.dreamData?.image) {
                chatApi.fetchChatHistory({ chatId }).then((res) => {
                  setChatState(chatId, {
                    chatId,
                    dreamData: { ...res, imageAndTagsLoaded: true },
                  });
                });
              }
              set({ activeRequests: get().activeRequests - 1 });
            },
          }
        );

        useReportStore.getState().createNew();
        clearDreamInput();
        const date1 = +new Date();
        timeoutId = setInterval(async () => {
          const date2 = +new Date();
          if (date2 - date1 > 35000) {
            clearInterval(timeoutId as NodeJS.Timeout);
            timeoutId = null;
            setChatState(chatId, {
              chatId,
              dreamData: {
                ...state?.dreamData,
                imageAndTagsLoaded: true,
              } as unknown as ChatHistoryDTO,
            });
            return;
          }
          const result = await chatApi.fetchChatHistory({ chatId });
          if (result.image && result.tags?.length) {
            setChatState(chatId, {
              chatId,
              dreamData: { ...result, imageAndTagsLoaded: true },
            });

            clearInterval(timeoutId as NodeJS.Timeout);
            timeoutId = null;
          }
        }, 7000);
      } else {
        const lastMessage = state?.messages[state.messages.length - 1];

        // 如果最后一条消息是正在聊天的消息，就不请求接口
        if (lastMessage?.chatting || lastMessage?.streaming) {
          setChatState(chatId, {
            chatId: chatId,
            dreamData: { ...state?.dreamData, imageAndTagsLoaded: true } as ChatHistoryDTO,
            messages: state?.messages,
          });
        } else {
          // 请求接口
          const result = await chatApi.fetchChatHistory({ chatId });

          setChatState(chatId, {
            chatId,
            dreamData: { ...result, imageAndTagsLoaded: true },
            messages: result.messages,
          });
          set({ activeRequests: get().activeRequests - 1 });
        }
      }

      // return finalChatId;
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
