import { View, Text, Picker, Image } from "@tarojs/components"
import styles from './index.module.scss'

const X = () => {

  const generateCalendarDays = () => {
    const { currentYear, currentMonth } = state;
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    
    let firstDayWeek = firstDay.getDay();
    firstDayWeek = firstDayWeek === 0 ? 6 : firstDayWeek - 1;
    
    const totalDays = lastDay.getDate();
    const rows = Math.ceil((totalDays + firstDayWeek) / 7);
    const calendarDays: CalendarDay[][] = [];

    let date = 1;
    const today = formatDate(new Date());

    for (let i = 0; i < rows; i++) {
      const row: CalendarDay[] = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayWeek) {
          row.push({ day: '', date: '' });
        } else if (date > totalDays) {
          row.push({ day: '', date: '' });
        } else {
          const currentDate = formatDate(new Date(currentYear, currentMonth - 1, date));
          const dreamInfo = getDreamInfo(currentDate);
          row.push({
            day: date,
            date: currentDate,
            isToday: currentDate === today,
            isSelected: currentDate === state.selectedDate,
            hasPositiveDream: dreamInfo.hasPositive,
            hasNegativeDream: dreamInfo.hasNegative
          });
          date++;
        }
      }
      calendarDays.push(row);
    }

    setState(prev => ({ ...prev, calendarDays }));
    updateSelectedDateDreams();
  };
  const handleDatePickerChange = (e: any) => {
    const dateStr = e.detail.value;
    const [year, month] = dateStr.split('-').map(Number);
    setState(prev => ({
      ...prev,
      currentYear: year,
      currentMonth: month
    }));
    generateCalendarDays();
  };

  const handleDateSelect = (date: string) => {
    if (!date) return;
    setState(prev => ({ ...prev, selectedDate: date }));
    generateCalendarDays();
  };

  const handlePrevMonth = () => {
    setState(prev => {
      let { currentYear, currentMonth } = prev;
      if (currentMonth === 1) {
        currentMonth = 12;
        currentYear -= 1;
      } else {
        currentMonth -= 1;
      }
      return { ...prev, currentYear, currentMonth };
    });
    generateCalendarDays();
  };

  const handleNextMonth = () => {
    setState(prev => {
      let { currentYear, currentMonth } = prev;
      if (currentMonth === 12) {
        currentMonth = 1;
        currentYear += 1;
      } else {
        currentMonth += 1;
      }
      return { ...prev, currentYear, currentMonth };
    });
    generateCalendarDays();
  };

  return <View className={styles.calendarView}>
  {/* 年月选择器 */}
  <View className={styles.calendarHeader}>
    <View className={styles.monthSelector}>
      <View className={styles.arrow} onClick={handlePrevMonth}>
        <Text className={styles.iconfont}>←</Text>
      </View>
      <Picker
        mode='date'
        fields='month'
        value={`${state.currentYear}-${state.currentMonth}`}
        onChange={handleDatePickerChange}
        className={styles.currentMonth}
      >
        <View className={styles.pickerText}>
          <Text>{state.currentYear}年{state.currentMonth}月</Text>
          <Text className={styles.pickerArrow}>▼</Text>
        </View>
      </Picker>
      <View className={styles.arrow} onClick={handleNextMonth}>
        <Text className={styles.iconfont}>→</Text>
      </View>
    </View>
  </View>

  {/* 星期表头 */}
  <View className={styles.weekdayHeader}>
    {state.weekdays.map(weekday => (
      <View key={weekday} className={styles.weekday}>{weekday}</View>
    ))}
  </View>

  {/* 日历主体 */}
  <View className={styles.calendarBody}>
    {state.calendarDays.map((row, rowIndex) => (
      <View key={rowIndex} className={styles.calendarRow}>
        {row.map((cell, cellIndex) => (
          <View
            key={`${rowIndex}-${cellIndex}`}
            className={`${styles.calendarCell} 
              ${cell.isToday ? styles.today : ''} 
              ${cell.hasPositiveDream ? styles.positive : ''} 
              ${cell.hasNegativeDream ? styles.negative : ''} 
              ${cell.isSelected ? styles.selected : ''}`}
            onClick={() => handleDateSelect(cell.date)}
          >
            <Text>{cell.day}</Text>
            {(cell.hasPositiveDream || cell.hasNegativeDream) && (
              <View className={styles.dreamIndicator} />
            )}
          </View>
        ))}
      </View>
    ))}
  </View>

  {/* 选中日期的梦境记录 */}
  <View className={styles.selectedDateDreams}>
    {state.selectedDateDreams.length > 0 ? (
      state.selectedDateDreams.map(dream => (
        <View
          key={dream.id}
          className={styles.dreamCard}
          onClick={() => viewDreamDetail(dream.id)}
        >
          <View className={styles.cardHeader}>
            <Text className={styles.cardTitle}>{dream.title}</Text>
            <Text className={styles.cardDate}>{dream.date} {dream.weekday}</Text>
          </View>
          <Image className={styles.dreamImage} src={dream.image} mode='aspectFill' />
          <Text className={styles.dreamContent}>{dream.content}</Text>
          <View className={styles.tagList}>
            {dream.tags.map((tag, index) => (
              <View key={index} className={styles.tag}>{tag}</View>
            ))}
          </View>
        </View>
      ))
    ) : (
      <View className={styles.noDreams}>
        <Text>这一天还没有梦境记录哦～</Text>
      </View>
    )}
  </View>
</View>
}