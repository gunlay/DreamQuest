import { http } from "@/utils/request";
import { ChatStatiticDTO } from "./types/profile";

export const profileApi = {
  fetchMonthReport: async () => {
    return http.post<string>("/dream/ai/month-report").then((res) => res);
  },

  fetchChatStatistics: async () => {
    return http
      .post<ChatStatiticDTO>("/dream/chat/statistics")
      .then((res) => res)
      .catch(() => 0);
  },
};
