import dayjs from "dayjs";
import { View, Picker, Text } from "@tarojs/components";
import useCalendarHooks from "@/hooks/useCalendarHooks";
import { Calendar, DatePicker, Day } from "@antmjs/vantui";
import DreamCard from "../DreamCard";
import style from "./index.module.scss";


const CalendarView = () => {


  const {
    showRange,
    currentYear,
    currentMonth,
    onDatePickerChange,
    prevMonth,
    nextMonth,
    selectedDateDreams
  } = useCalendarHooks()

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

      <View className={style["calendar-body"]}>
        <Calendar
          poppable={false}
          showConfirm={false}
          showMark={false}
          showTitle={false}          
          firstDayOfWeek={1}
          minDate={showRange[0] as unknown as Date}
          maxDate={showRange[1] as unknown as Date}
          className={style['calendar']}
          formatter={(day: Day) => {
            const isToday = dayjs(day.date).isSame(dayjs(), 'day');
            return {
              ...day,
              className: isToday ? style['today'] : ''
            }
          }}
          style={{
            background: 'transparent'
          }}
        />
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
