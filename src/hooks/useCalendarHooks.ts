import { recordApi } from "@/api/record";
import { DreamCardVO } from "@/api/types/record";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const useCalendarHooks = () => {
  const [showRange, setShowRange] = useState<[Date, Date]>(
    [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()]
  );
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth() + 1
  );

  const [dreams, setDreams] = useState<DreamCardVO[]>([])

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
      //  给showRange赋值,第一项应该是currentYear的上一年12月1日,第二项应该是上一年12月30日
      setShowRange([dayjs(`${currentYear - 1}-12-01`).toDate(), dayjs(`${currentYear - 1}-12-31`).toDate()]);
    } else {
      setCurrentMonth((prev) => prev - 1);
      //  给showRange赋值,第一项应该是上一个月1日,第二项应该上一个月最后一天
      setShowRange([dayjs(`${currentYear}-${currentMonth - 1}-01`).toDate(), dayjs(`${currentYear}-${currentMonth - 1}-01`).endOf('month').toDate()]);
    }
  };

  const onDatePickerChange = (e: any) => {
    const dateStr = e.detail.value as string;
    const [year, month] = dateStr.split("-").map(Number);
    setCurrentYear(year);
    setCurrentMonth(month);
    // 给setShowRange赋值,第一项应该是选中year选中month的1日,第二项应该是选中year,选中month的最后一天
    setShowRange([dayjs(`${year}-${month}-01`).toDate(), dayjs(`${year}-${month}-01`).endOf('month').toDate()]);
  };

  const nextMonth = () => {
    
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
      //  给showRange赋值,第一项应该是currentYear的下一年1月1日,第二项应该是下一年1月31日
      setShowRange([dayjs(`${currentYear + 1}-01-01`).toDate(), dayjs(`${currentYear + 1}-01-31`).toDate()]);
      
    } else {
      setCurrentMonth(currentMonth + 1);
      //  给showRange赋值,第一项应该是下一个月1日,第二项应该下一个月最后一天
      setShowRange([dayjs(`${currentYear}-${currentMonth + 1}-01`).toDate(), dayjs(`${currentYear}-${currentMonth + 1}-01`).endOf('month').toDate()]);
    }
  };

  const fetchDreams = async (date: Date) => {
    const res = await recordApi.fetchDreamList({ date: dayjs(date).format('YYYY-MM-DD') })
    setDreams(res.list.map(dto => {
      return {
        ...dto,
         date: dayjs(dto.createTime).format('YYYY.MM.DD'),
        weekday: `周${['日', '一', '二', '三', '四', '五', '六'][dayjs(dto.createTime).day()]}`
      }
    }))
  }

  const initCalendar = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
    fetchDreams(today)
  };

  
  useEffect(() => {
    initCalendar();
  }, []);

  return {
    dreams,
    showRange,
    currentYear,
    currentMonth,   
    fetchDreams, 
    prevMonth,
    onDatePickerChange,
    nextMonth,
  }
}

export default useCalendarHooks