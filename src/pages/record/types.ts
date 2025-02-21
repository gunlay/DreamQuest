export interface CalendarDay {
  day: string | number;
  date: string;
  isToday?: boolean;
  isSelected?: boolean;
  hasPositiveDream?: boolean;
  hasNegativeDream?: boolean;
}

export interface DreamRecord {
  id: number;
  title: string;
  date: string;
  weekday: string;
  image: string;
  content: string;
  tags: string[];
  emotion?: 'positive' | 'negative';
}

export interface MonthDreams {
  month: string;
  dreams: DreamRecord[];
}

export interface RecordState {
  currentTab: 'list' | 'calendar';
  searchKeyword: string;
  weekdays: string[];
  currentYear: number;
  currentMonth: number;
  calendarDays: CalendarDay[][];
  selectedDate: string;
  selectedDateDreams: DreamRecord[];
  dreamList: MonthDreams[];
  originalDreamList: MonthDreams[];
  isSearching: boolean;
} 