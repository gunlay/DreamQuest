import { http } from "@/utils/request";
import { ReocrdHistoryDTO } from "./types/record";
import { mockDreamList } from "../pages/record/mockData";

export interface FetchDreamRecodParams {
  pageParam?: {
    pageIndex: number;
    pageSize: number;
  },
  keyword?: string
} 

export const recordApi = {
  fetchDreamList: async (params?: FetchDreamRecodParams): Promise<ReocrdHistoryDTO> => {
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve({
        list: mockDreamList.slice(params?.pageParam?.pageIndex || 1, params?.pageParam?.pageSize || 10),
      } as ReocrdHistoryDTO);
    }
    return http
      .post<ReocrdHistoryDTO>("/dream/chat/history/page", params)
      .then(res => res);
  },
  
  fetchRecordList: async (params = {
    pageParam: {
      pageIndex: 1,
      pageSize: 10
    }
  }): Promise<ReocrdHistoryDTO> => {
    return http
      .post<ReocrdHistoryDTO>("/dream/chat/history/page", params)
      .then((res) => res);
  },
};