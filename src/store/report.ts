import { create } from 'zustand';

interface ReportState {
  retryFlag: boolean;
  setFlag: (tag: boolean) => void;
}

export const useReportStore = create<ReportState>((set) => ({
  retryFlag: false,

  setFlag: (tag: boolean) => {
    set({ retryFlag: tag });
  },
}));
