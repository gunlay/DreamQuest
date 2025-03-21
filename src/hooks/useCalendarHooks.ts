import { ITouchEvent } from '@tarojs/components';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { recordApi } from '@/api/record';
import { DreamCardDTO } from '@/api/types/record';

const useCalendarHooks = () => {
  const [showRange, setShowRange] = useState<[Date, Date]>([
    dayjs().startOf('month').toDate(),
    dayjs().endOf('month').toDate(),
  ]);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);

  const [dreams, setDreams] = useState<DreamCardDTO[]>([]);

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
      //  给showRange赋值,第一项应该是currentYear的上一年12月1日,第二项应该是上一年12月30日
      setShowRange([
        dayjs(`${currentYear - 1}-12-01`).toDate(),
        dayjs(`${currentYear - 1}-12-31`).toDate(),
      ]);
    } else {
      setCurrentMonth((prev) => prev - 1);
      //  给showRange赋值,第一项应该是上一个月1日,第二项应该上一个月最后一天
      setShowRange([
        dayjs(`${currentYear}-${currentMonth - 1}-01`).toDate(),
        dayjs(`${currentYear}-${currentMonth - 1}-01`)
          .endOf('month')
          .toDate(),
      ]);
    }
  };

  const onDatePickerChange = (e: ITouchEvent) => {
    const dateStr = e.detail.value as string;
    if (dateStr === `${currentYear}-${currentMonth}`) return;
    const [year, month] = dateStr.split('-').map(Number);
    setCurrentYear(year);
    setCurrentMonth(month);
    // 给setShowRange赋值,第一项应该是选中year选中month的1日,第二项应该是选中year,选中month的最后一天
    setShowRange([
      dayjs(`${year}-${month}-01`).toDate(),
      dayjs(`${year}-${month}-01`).endOf('month').toDate(),
    ]);
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
      //  给showRange赋值,第一项应该是currentYear的下一年1月1日,第二项应该是下一年1月31日
      setShowRange([
        dayjs(`${currentYear + 1}-01-01`).toDate(),
        dayjs(`${currentYear + 1}-01-31`).toDate(),
      ]);
    } else {
      setCurrentMonth(currentMonth + 1);
      //  给showRange赋值,第一项应该是下一个月1日,第二项应该下一个月最后一天
      setShowRange([
        dayjs(`${currentYear}-${currentMonth + 1}-01`).toDate(),
        dayjs(`${currentYear}-${currentMonth + 1}-01`)
          .endOf('month')
          .toDate(),
      ]);
    }
  };

  const fetchDreams = async (date: string) => {
    const res = await recordApi.fetchDreamList({ date });
    setDreams(res.list);
  };

  const initCalendar = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
    fetchDreams(dayjs(today).format('YYYY-MM-DD'));
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
  };
};

export default useCalendarHooks;
