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
      const { pageIndex = 1, pageSize = 10 } = params?.pageParam || {}
      const result = {
        list: mockDreamList.slice((pageIndex - 1) * pageSize, (pageIndex - 1) * pageSize + pageSize),
        total: 15
      } as ReocrdHistoryDTO
      return Promise.resolve(result);
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