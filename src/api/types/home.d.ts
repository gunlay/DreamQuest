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