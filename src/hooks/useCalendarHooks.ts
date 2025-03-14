import { formatDate } from "@/utils/date";
import Taro from "@tarojs/taro";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

const useCalendarHooks = () => {
  const [showRange, setShowRange] = useState<[Dayjs, Dayjs]>(
    [dayjs().startOf('month'), dayjs().endOf('month')]
  );
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedDateDreams, setSelectedDateDreams] = useState<DreamRecord[]>(
    []
  );
  const getDreamInfo = (date: string) => {
    const dreams = Taro.getStorageSync("dreams") || [];
    const dayDreams = dreams.filter(
      (dream: DreamRecord) => dream.date === date
    );
    return {
      hasPositive: dayDreams.some((dream) => dream.emotion === "positive"),
      hasNegative: dayDreams.some((dream) => dream.emotion === "negative"),
    };
  };

  const updateSelectedDateDreams = () => {
    const dreams = Taro.getStorageSync("dreams") || [];
    const newSelectedDateDreams = dreams.filter(
      (dream: DreamRecord) => dream.date === selectedDate
    );
    setSelectedDateDreams(newSelectedDateDreams);
  };
  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const onDatePickerChange = (e: any) => {
    const dateStr = e.detail.value as string;
    const [year, month] = dateStr.split("-").map(Number);
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const initCalendar = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
    setSelectedDate(formatDate(today));
  };
  
  useEffect(() => {
    initCalendar();
  }, []);

  return {
    showRange,
    currentYear,
    currentMonth,    
    selectedDateDreams,
    prevMonth,
    onDatePickerChange,
    nextMonth,
  }
}

export default useCalendarHooks