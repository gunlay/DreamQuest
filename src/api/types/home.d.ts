export type TimeType = "today" | "nextday" | "week" | "month";
export type HoroType =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";
export interface FortuneDTO {
  all: string;
  health: string;
  love: string;
  money: string;
  work: string;
}
export interface LuckDTO {
  luckycolor: string;
  luckyconstellation: string;
  luckynumber: string;
}
export interface HoroScopeDTO extends LuckDTO {
  fortune: FortuneDTO;
  fortunetext: FortuneDTO;
  // index
  shortcomment: string;
  time: string;
  title: string;
  todo: {
    ji: string;
    yi: string;
  };
  type: string;
  uptype: string;
}

// 周报内容接口定义
export interface WeeklyReportContent {
  keywords: string; // 关键词分析
  analysis: string; // 梦境解析
  emotionTrend: string; // 情绪趋势
  aiSuggestion: string; // AI建议
}

export interface DreamRecord {
  id: number; // 记录ID
  title: string; // 标题
  content: string; // 梦境内容
  date: string; // 记录日期
  weekday: string; // 星期几
  emotion?: string; // 情绪标签
  tags?: string[]; // 标签
  image?: string; // 梦境图片
  analysis?: string; // AI分析
}

// 周报数据接口定义
export interface WeeklyReportData {
  startDate: string; // 开始日期
  endDate: string; // 结束日期
  dreamCount: number; // 梦境记录数量
  emotions: {
    positive: number; // 积极情绪数量
    neutral: number; // 中性情绪数量
    negative: number; // 消极情绪数量
  };
  themes: {
    work: number; // 工作相关
    life: number; // 生活相关
    relationship: number; // 人际关系
    other: number; // 其他
  };
  keywords: string[]; // 关键词列表
}

// DeepSeek API 响应类型
export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}
