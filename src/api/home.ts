import { http } from '@/utils/request';
import { HoroScopeDTO, HoroType, TimeType } from './types/home';
import { DreamCardDTO } from './types/record';

export const homeApi = {
  fetchHomeInfo: async () => {
    return http
      .get<{
        content: string;
        date: string;
        title: string;
        week: string;
      }>('/dream/ai/homePage')
      .then((res) => res);
  },
  fetchHoroScope: async (params: { time: TimeType; type: HoroType }) => {
    return http.post<HoroScopeDTO>('/dream/ai/default/horoscope', params).then((res) => res);
  },
  fetchWeekMessage: async () => {
    return http.post<DreamCardDTO[]>('/dream/chat/week/message').then((res) => res);
  },

  fetchWeeklyReport: async (params?: { retryFlag?: boolean }) => {
    return http.post<string>('/dream/ai/weekly-report', params).then((res) => res);
  },
};
