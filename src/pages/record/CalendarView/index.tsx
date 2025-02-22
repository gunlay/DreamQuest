import { useEffect, useState } from "react";
import { View, Picker, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { formatDate } from "@/utils/date";
import DreamCard from "../DreamCard";
import { CalendarDay, DreamRecord } from "../types";
import style from "./index.module.scss";

const CalendarView = () => {
  const weekdays = ["一", "二", "三", "四", "五", "六", "日"];
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

  const selectDate = (date: string) => {
    if (!date) return;
    setSelectedDate(date);
    generateCalendarDays(date);
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

  useEffect(() => {
    initCalendar();
  }, []);

  return (
    <View className={style["calendar-view"]}>
      <View className={style["calendar-header"]}>
        <View className={style["month-selector"]}>
          <View className={style["arrow"]} onClick={prevMonth}>
            <Text className={style["iconfont"]}>←</Text>
          </View>
          <Picker
            mode="date"
            fields="month"
            value={`${currentYear}-${currentMonth}`}
            onChange={onDatePickerChange}
            className={style["current-month"]}
          >
            <View className={style["picker-text"]}>
              <Text>
                {currentYear}年{currentMonth}月
              </Text>
              <Text className={style["picker-arrow"]}>▼</Text>
            </View>
          </Picker>
          <View className={style["arrow"]} onClick={nextMonth}>
            <Text className={style["iconfont"]}>→</Text>
          </View>
        </View>
      </View>

      <View className={style["weekday-header"]}>
        {weekdays.map((item) => (
          <View className={style["weekday"]} key={item}>
            {item}
          </View>
        ))}
      </View>
      <View className={style["calendar-body"]}>
        {calendarDays.map((row, index) => (
          <View className={style["calendar-row"]} key={index}>
            {row.map((r, i) => (
              <View
                className={`${style["calendar-cell"]} 
              ${r.isToday ? style["today"] : ""} 
              ${r.hasPositiveDream ? style["positive"] : ""}
              ${r.hasNegativeDream ? style["negative"] : ""}
              ${r.isSelected ? style["selected"] : ""}
            `}
                key={i}
                data-date={r.date}
                onClick={() => selectDate(r.date)}
              >
                <Text>{r.day}</Text>
                {r.hasPositiveDream || r.hasNegativeDream ? (
                  <View className={style["dream-indicator"]}></View>
                ) : null}
              </View>
            ))}
          </View>
        ))}
      </View>
      <View className={style["selected-date-dreams"]}>
        {selectedDateDreams.length > 0 ? (
          <>
            {selectedDateDreams.map((item) => (
              <DreamCard dream={item} key={item.id} />
            ))}
          </>
        ) : (
          <View className={style["no-dreams"]}>
            <Text>这一天还没有梦境记录哦～</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default CalendarView;
