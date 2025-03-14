import { formatDate } from "@/utils/date";
import Taro from "@tarojs/taro";
import { useState } from "react";

const useCalendarHooks = () => {
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [calendarDays, setCalendarDays] = useState<CalendarDay[][]>([]);
  const [selectedDateDreams, setSelectedDateDreams] = useState<DreamRecord[]>(
    []
  );
  const generateCalendarDays = (
    _selectedDate = selectedDate,
    _currentYear = currentYear,
    _currentMonth = currentMonth
  ) => {
    const firstDay = new Date(_currentYear, _currentMonth - 1, 1);
    const lastDay = new Date(_currentYear, _currentMonth, 0);

    let firstDayWeek = firstDay.getDay();
    firstDayWeek = firstDayWeek === 0 ? 6 : firstDayWeek - 1;

    const totalDays = lastDay.getDate();
    const rows = Math.ceil((totalDays + firstDayWeek) / 7);
    const newCalendarDays: CalendarDay[][] = [];

    let date = 1;
    const today = formatDate(new Date());

    for (let i = 0; i < rows; i++) {
      const row: CalendarDay[] = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayWeek) {
          row.push({ day: "", date: "" });
        } else if (date > totalDays) {
          row.push({ day: "", date: "" });
        } else {
          const currentDate = formatDate(
            new Date(_currentYear, _currentMonth - 1, date)
          );
          const dreamInfo = getDreamInfo(currentDate);
          row.push({
            day: date,
            date: currentDate,
            isToday: currentDate === today,
            isSelected: currentDate === _selectedDate,
            hasPositiveDream: dreamInfo.hasPositive,
            hasNegativeDream: dreamInfo.hasNegative,
          });
          date++;
        }
      }
      newCalendarDays.push(row);
    }

    setCalendarDays(newCalendarDays);
    updateSelectedDateDreams();
  };

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
      generateCalendarDays(undefined, currentYear - 1, 12);
    } else {
      setCurrentMonth((prev) => prev - 1);
      generateCalendarDays(undefined, undefined, currentMonth - 1);
    }
  };

  const onDatePickerChange = (e: any) => {
    const dateStr = e.detail.value as string;
    const [year, month] = dateStr.split("-").map(Number);
    setCurrentYear(year);
    setCurrentMonth(month);
    generateCalendarDays(undefined, year, month);
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
      generateCalendarDays(undefined, currentYear + 1, 1);
    } else {
      setCurrentMonth(currentMonth + 1);
      generateCalendarDays(undefined, undefined, currentMonth + 1);
    }
  };

  const initCalendar = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
    setSelectedDate(formatDate(today));
    generateCalendarDays(
      formatDate(today),
      today.getFullYear(),
      today.getMonth() + 1
    );
  };

  return {
    currentYear,
    currentMonth,    
    selectedDateDreams,
    prevMonth,
    onDatePickerChange,
    nextMonth,
    initCalendar
  }
}

export default useCalendarHooks