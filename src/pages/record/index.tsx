/// <reference types="@tarojs/taro" />
import { View, Text, Image, Input, ScrollView, Picker } from '@tarojs/components';
import { useEffect, useState } from 'react';
import type { FC } from 'react';
import Taro from '@tarojs/taro';
import MainBg from '@/assets/image/main/main_bg.png'
import { CalendarDay, DreamRecord, MonthDreams, RecordState } from './types';
import styles from './index.module.scss';

const Record: FC = () => {
  const [state, setState] = useState<RecordState>({
    currentTab: 'list',
    searchKeyword: '',
    weekdays: ['一', '二', '三', '四', '五', '六', '日'],
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    calendarDays: [],
    selectedDate: '',
    selectedDateDreams: [],
    dreamList: [],
    originalDreamList: [],
    isSearching: false
  });

  useEffect(() => {
    initCalendar();
  }, []);

  useEffect(() => {
    loadDreams();
  }, []);

  const loadDreams = () => {
    const dreams = Taro.getStorageSync('dreams') || [];
    const groupedDreams = groupDreamsByMonth(dreams);
    setState(prev => ({
      ...prev,
      dreamList: groupedDreams,
      originalDreamList: groupedDreams
    }));

    if (state.currentTab === 'calendar') {
      generateCalendarDays();
    }
  };

  const groupDreamsByMonth = (dreams: DreamRecord[]): MonthDreams[] => {
    const grouped: { [key: string]: DreamRecord[] } = {};
    
    dreams.forEach(dream => {
      const month = dream.date.split('.')[1];
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(dream);
    });
    
    return Object.keys(grouped)
      .sort((a, b) => Number(b) - Number(a))
      .map(month => ({
        month,
        dreams: grouped[month]
      }));
  };

  const viewDreamDetail = (dreamId: number) => {
    const dreams = Taro.getStorageSync('dreams') || [];
    const dreamData = dreams.find((dream: DreamRecord) => dream.id === dreamId);
    
    if (dreamData) {
      Taro.setStorageSync('currentDream', dreamData);
      Taro.navigateTo({
        url: '/pages/analysis/analysis'
      });
    }
  };

  const initCalendar = () => {
    const today = new Date();
    setState(prev => ({
      ...prev,
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth() + 1,
      selectedDate: formatDate(today)
    }));
    generateCalendarDays();
  };

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

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const getDreamInfo = (date: string) => {
    const dreams = Taro.getStorageSync('dreams') || [];
    const dayDreams = dreams.filter((dream: DreamRecord) => dream.date === date);
    return {
      hasPositive: dayDreams.some(dream => dream.emotion === 'positive'),
      hasNegative: dayDreams.some(dream => dream.emotion === 'negative')
    };
  };

  const updateSelectedDateDreams = () => {
    const dreams = Taro.getStorageSync('dreams') || [];
    const selectedDateDreams = dreams.filter(
      (dream: DreamRecord) => dream.date === state.selectedDate
    );
    setState(prev => ({ ...prev, selectedDateDreams }));
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

  const handleTabSwitch = (tab: 'list' | 'calendar') => {
    setState(prev => ({ ...prev, currentTab: tab }));
    if (tab === 'calendar') {
      initCalendar();
    }
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

  const handleSearchInput = (e: any) => {
    setState(prev => ({
      ...prev,
      searchKeyword: e.detail.value
    }));
  };

  const handleClearSearch = () => {
    setState(prev => ({
      ...prev,
      searchKeyword: '',
      dreamList: prev.originalDreamList,
      isSearching: false
    }));
  };

  const handleSearch = () => {
    const { searchKeyword, originalDreamList } = state;
    if (!searchKeyword.trim()) {
      setState(prev => ({
        ...prev,
        dreamList: originalDreamList,
        isSearching: false
      }));
      return;
    }

    const keyword = searchKeyword.toLowerCase();
    const filteredList = originalDreamList.map(monthData => ({
      month: monthData.month,
      dreams: monthData.dreams.filter(dream =>
        dream.title.toLowerCase().includes(keyword) ||
        dream.content.toLowerCase().includes(keyword) ||
        dream.tags.some(tag => tag.toLowerCase().includes(keyword))
      )
    })).filter(monthData => monthData.dreams.length > 0);

    setState(prev => ({
      ...prev,
      dreamList: filteredList,
      isSearching: true
    }));
  };

  return (
    <View className={styles.container}>
      <Image 
        className={styles.bgImage} 
        src={MainBg}
        mode='aspectFill' 
      />

      {state.currentTab === 'list' ? (
        <>
          <View className={styles.fixedHeader}>
            {/* Tab 切换 */}
            <View className={styles.tabHeader}>
              <View 
                className={`${styles.tabItem} ${state.currentTab === 'list' ? styles.active : ''}`}
                onClick={() => handleTabSwitch('list')}
              >
                <Text>列表</Text>
                <View className={styles.tabLine} />
              </View>
              <View 
                className={`${styles.tabItem} ${state.currentTab === 'calendar' ? styles.active : ''}`}
                onClick={() => handleTabSwitch('calendar')}
              >
                <Text>日历</Text>
                <View className={styles.tabLine} />
              </View>
            </View>

            {/* 搜索区域 */}
            <View className={styles.searchArea}>
              <View className={styles.searchInputWrapper}>
                <Image className={styles.searchIcon} src='/assets/icons/search.png' mode='aspectFit' />
                <Input
                  className={styles.searchInput}
                  placeholder='Search'
                  placeholderStyle='color: rgba(0, 0, 0, 0.3)'
                  value={state.searchKeyword}
                  onInput={handleSearchInput}
                />
                {state.searchKeyword && (
                  <View className={styles.clearIcon} onClick={handleClearSearch}>×</View>
                )}
              </View>
              <View className={styles.searchBtn} onClick={handleSearch}>搜索</View>
            </View>
          </View>

          {/* 列表内容区域 */}
          <ScrollView className={styles.contentArea} scrollY enableFlex>
            {state.dreamList.map(monthData => (
              <View key={monthData.month}>
                <View className={styles.monthTitle}>{monthData.month} 月</View>
                {monthData.dreams.map(dream => (
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
                ))}
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <>
          <View className={`${styles.fixedHeader} ${styles.calendarHeaderOnly}`}>
            {/* Tab 切换 */}
            <View className={styles.tabHeader}>
              <View 
                className={`${styles.tabItem} ${state.currentTab === 'list' ? styles.active : ''}`}
                onClick={() => handleTabSwitch('list')}
              >
                <Text>列表</Text>
                <View className={styles.tabLine} />
              </View>
              <View 
                className={`${styles.tabItem} ${state.currentTab === 'calendar' ? styles.active : ''}`}
                onClick={() => handleTabSwitch('calendar')}
              >
                <Text>日历</Text>
                <View className={styles.tabLine} />
              </View>
            </View>
          </View>

          <View className={styles.calendarView}>
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
        </>
      )}
    </View>
  );
};

export default Record; 