import { http } from "@/utils/request";
import { ChatHistoryDTO, ChatStatiticDTO } from "./types/chat";

export const chatApi = {
  createNewChat: async (params: {
    content: string
    title: string
  }): Promise<{chatId: string}> => {
    return http
      .post<{chatId: string}>("/dream/chat/create", params)
      .then((res) => res);
  },

  saveMessages: async (params: {
    chatId: string
    message: string
    type: 'ai' | 'user'
  }) => {
    return http
      .post("/dream/chat/save/message", params)
      .then((res) => res);
  },

  fetchChatHistory: async (params: {chatId: string}): Promise<ChatHistoryDTO[]> => {
    return http
      .post<ChatHistoryDTO[]>("/dream/chat/history", params)
      .then((res) => res);
  },

  fetchChatStatistics: async () => {
    return http
      .post<ChatStatiticDTO>("/dream/chat/statistics")
      .then((res) => res)
      .catch(() => ({
        moreDate: '周三',
        num: 500
      }));
  },

  fetchAIResponse: async (params: {
    chatId: string
    message: string
    type: 'ai' | 'user'
  }) => {
    return http
      .post("/dream/ai/response", params)
      .then((res) => res);
  },
};