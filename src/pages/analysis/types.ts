export interface Message {
  type: "ai" | "user";
  content: string;
  id?: string;
}

export interface DreamData {
  id: number;
  title: string;
  content: string;
  date: string;
  weekday?: string;
  image?: string;
  tags?: string[];
}

export interface DreamRecord {
  id: number;
  title: string;
  content: string;
  date: string;
  weekday: string;
  image: string;
  tags: string[];
  analysis?: string; // AI 的初始分析内容
  messages?: Message[]; // 完整的聊天记录
}
