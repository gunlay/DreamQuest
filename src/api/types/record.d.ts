export interface DreamCardDTO {
  date: string;
  week: string;
  desc: string;
  chatId: number;
  image: string;
  tags: string[];
  title: string;
}

export interface MonthDreams {
  type: string;
  month: string;
  dream: DreamCardDTO;
}

export interface ReocrdHistoryDTO {
  // content: string
  createBy: string;
  createTime: string;
  desc: string;
  id: number;
  image: string;
  isDeleted: boolean;
  title: string;
  updateBy: string;
  updateTime: string;
  list: DreamCardDTO[];
  total: number;
}
