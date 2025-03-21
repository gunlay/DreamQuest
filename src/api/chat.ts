import { http } from '@/utils/request';
import { ChatHistoryDTO, ChatMessageDTO, NewMessageDTO } from './types/chat';
import { ChatStatiticDTO } from './types/profile';

export const chatApi = {
  createNewChat: async (params: NewMessageDTO): Promise<{ chatId: string }> => {
    return http.post<{ chatId: string }>('/dream/chat/create', params).then((res) => res);
  },

  sendMessages: async (params: ChatMessageDTO) => {
    return http.post<string>('/dream/chat/save/message', params).then((res) => res);
  },

  fetchChatHistory: async (params: { chatId: string }): Promise<ChatHistoryDTO> => {
    return http.post<ChatHistoryDTO>('/dream/chat/current/chat', params).then((res) => res);
  },

  fetchChatStatistics: async () => {
    return http.post<ChatStatiticDTO>('/dream/chat/statistics').then((res) => res);
  },

  fetchAIResponse: async (params: { chatId: string; message: string; type: 'ai' | 'user' }) => {
    return http.post('/dream/ai/response', params).then((res) => res);
  },
};
