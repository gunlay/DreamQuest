export interface DateInfo {
  date: string;
  weekday: string;
}

export interface DreamTheory {
  title: string;
  content: string;
}

export interface Fortune {
  overall: string;
  career: string;
  love: string;
  money: string;
  health: string;
  luckyNumber: string;
  luckyColor: string;
  luckyDirection: string;
}

export interface WeeklyReportParams {
  keywords: string;
  analysis: string;
  emotionTrend: string;
  aiSuggestion: string;
}

export interface DreamData {
  id: number;
  content: string;
  // Add other dream-related fields as needed
}
