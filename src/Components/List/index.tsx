import { ScrollView, View, Text } from '@tarojs/components';
import Taro, { createSelectorQuery } from '@tarojs/taro';
import { ReactNode, useEffect, useRef, useState } from 'react';
import style from './index.module.scss';

interface ListProps<T> {
  /** 加载更多的回调函数 */
  onLoadMore: (
    params: {
      pageIndex: number;
      pageSize: number;
    },
    oringinData?: T[]
  ) => Promise<{
    /** 当前分页数据 */
    list: T[];
    /** 总数据量 */
    total: number;
  }>;
  /** 自定义渲染项 */
  renderItem: (item: T, index: number) => ReactNode | JSX.Element;
  /** 空状态展示文案 */
  emptyText?: string;
  /** 加载中文案 */
  loadingText?: string;
  /** 没有更多数据文案 */
  noMoreText?: string;
  /** 下拉刷新文案 */
  refreshingText?: string;
  /** 每页数据量 */
  pageSize?: number;
  /**list窗口高度, 默认100vh */
  height?: string;
  className?: string;
}

const List = <T,>({
  onLoadMore,
  renderItem,
  emptyText = '暂无数据',
  loadingText = '加载中...',
  noMoreText = '没有更多了',
  pageSize = 10,
  height = '100vh',
  refreshingText = '下拉刷新...',
  className,
}: ListProps<T>) => {
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<any>(null);
  const loading = useRef<boolean>(false);
  const clientHeight = useRef<number>(0);

  useEffect(() => {
    Taro.nextTick(() => {
      createSelectorQuery()
        .selectAll('#list-scroll')
        .boundingClientRect()
        .exec((res) => {
          clientHeight.current = res[0][0].height;
        });
    });
  }, []);

  const loadData = async (pageIndex: number, isRefresh = false) => {
    if ((loading.current && !isRefresh) || (!hasMore && !isRefresh)) return;

    loading.current = true;

    try {
      const result = await onLoadMore({ pageIndex, pageSize }, data);
      const newData = pageIndex === 1 ? result.list : [...data, ...result.list];
      setData(newData);
      setHasMore(newData.length < result.total);
      setCurrentPage(pageIndex);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      loading.current = false;
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setHasMore(true);
    await loadData(1, true);
  };

  const handleScroll = async (e: any) => {
    const { scrollTop, scrollHeight } = e.detail;

    if (scrollHeight - scrollTop - clientHeight.current <= 30) {
      loadData(currentPage + 1);
    }
  };

  useEffect(() => {
    loadData(1);
  }, []);

  return (
    <ScrollView
      id="list-scroll"
      className={`${style['list-container']} ${className}`}
      scrollY
      enableFlex
      refresherEnabled
      refresherTriggered={refreshing}
      refresherDefaultStyle="none"
      refresherBackground="transparent"
      refresherThreshold={45}
      onRefresherRefresh={onRefresh}
      onRefresherRestore={() => setRefreshing(false)}
      onRefresherAbort={() => setRefreshing(false)}
      onScroll={handleScroll}
      ref={scrollRef}
      style={{ height }}
    >
      <View className={style['list-content']}>
        {data.length > 0 ? (
          data.map((item, index) => <View key={index}>{renderItem(item, index)}</View>)
        ) : (
          <View className={style.empty}>{emptyText}</View>
        )}

        {data.length > 0 && (
          <View className={style['loading-more']}>
            {loading.current ? (
              loadingText
            ) : hasMore ? (
              ''
            ) : (
              <Text className={style['no-more']}>{noMoreText}</Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default List;
