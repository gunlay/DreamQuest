import { http } from '@/utils/request';
import { ReocrdHistoryDTO } from './types/record';

export interface FetchDreamRecodParams {
  date?: string;
  pageParam?: {
    pageIndex: number;
    pageSize: number;
  };
  message?: string;
}

export const recordApi = {
  fetchDreamList: async (params?: FetchDreamRecodParams): Promise<ReocrdHistoryDTO> => {
    return http.post<ReocrdHistoryDTO>('/dream/chat/history/page', params).then((res) => res);
  },
};
