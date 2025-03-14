declare module 'lunar-javascript' {
  namespace Lunar {
    class Solar {
      static fromDate(date: Date): Solar;
      getLunar(): {
        getMonthInChinese(): string;
        getDayInChinese(): string;
      };
    }
  }
  export = Lunar;
} 