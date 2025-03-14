import { http } from "@/utils/request";
import {
  HoroScopeDTO,
  HoroType,
  TimeType,
} from "./types/home";


export const homeApi = {
  fetchHomeInfo: async () => {
    return http
      .get<{
        content: string;
        date: string;
        title: string;
        week: string;
      }>("/dream/ai/homePage")
      .then((res) => res);
  },
  fetchHoroScope: async (params: { time: TimeType; type: HoroType }) => {
    return http
      .post<HoroScopeDTO>("/dream/ai/default/horoscope", params)
      .then((res) => res);
  },

  fetchWeeklyReport: async () => {
    return http.post<string>("/dream/ai/weekly-report", {}).then((res) => res);
  },
};

