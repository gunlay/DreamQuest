import { http } from "@/utils/request";
import { ReocrdHistoryDTO } from "./types/record";

export const recordApi = {
  fetchRecordList: async (params: {
    pageParam: {
      pageIndex: number
      pageSize: number
    }
  }): Promise<ReocrdHistoryDTO[]> => {
    return http
      .post<ReocrdHistoryDTO[]>("/dream/chat/history/page", params)
      .then((res) => res);
  },
};