import { http } from "@/utils/request/index";
import { ChatDreamAnalysisDTO } from "./types/analysis";

export const analysisApi = {
  fetchChatDreamAnalysis: async (params: {chatId: string}): Promise<ChatDreamAnalysisDTO> => {
    return http
      .post<ChatDreamAnalysisDTO>("/dream/chat/history", params)
      .then((res) => res);
  },
};
