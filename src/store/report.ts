import { create } from 'zustand';

interface ReportState {
  retryFlag: {
    week: boolean;
    month: boolean;
  };
  setFlag: (type: 'week' | 'month', tag: boolean) => void;
  createNew: () => void;
}

export const useReportStore = create<ReportState>((set, get) => ({
  retryFlag: {
    week: true,
    month: true,
  },

  setFlag: (type: 'week' | 'month', tag: boolean) => {
    const { retryFlag } = get();
    retryFlag[type] = tag;
    set({
      retryFlag,
    });
  },
  createNew: () => {
    set({
      retryFlag: {
        week: true,
        month: true,
      },
    });
  },
}));
