import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text } from '@tarojs/components';
import style from './index.module.scss';

interface ListProps<T> {
  /** 加载更多的回调函数 */
  onLoadMore: (pageIndex: number, pageSize: number) => Promise<{
    /** 当前分页数据 */
    list: T[];
    /** 总数据量 */
    total: number;
  }>;
  /** 自定义渲染项 */
  renderItem: (item: T, index: number) => ReactNode;
  /** 空状态展示文案 */
  emptyText?: string;
  /** 加载中文案 */
  loadingText?: string;
  /** 没有更多数据文案 */
  noMoreText?: string;
  /** 每页数据量 */
  pageSize?: number;
}

const List = <T,>({
  onLoadMore,
  renderItem,
  emptyText = '暂无数据',
  loadingText = '加载中...',
  noMoreText = '没有更多了',
  pageSize = 10,
}: ListProps<T>) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<any>(null);
  const loadingRef = useRef(false);

  const loadData = async (pageIndex: number) => {
    if (loading || !hasMore || loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      const result = await onLoadMore(pageIndex, pageSize);
      const newData = pageIndex === 1 ? result.list : [...data, ...result.list];
      setData(newData);
      setHasMore(newData.length < result.total);
      setCurrentPage(pageIndex);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleScroll = async (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.detail;
    if (scrollHeight - scrollTop - clientHeight <= 100) {
      loadData(currentPage + 1);
    }
  };

  useEffect(() => {
    loadData(1);
  }, []);

  useEffect(() => {
    if (scrollRef.current && data.length < pageSize && hasMore) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      if (scrollHeight <= clientHeight) {
        loadData(currentPage + 1);
      }
    }
  }, [data.length]);

  return (
    <ScrollView
      className={style['list-container']}
      scrollY
      enableFlex
      onScroll={handleScroll}
      ref={scrollRef}
    >
      <View className={style['list-content']}>
        {data.length > 0 ? (
          data.map((item, index) => (
            <View key={index}>{renderItem(item, index)}</View>
          ))
        ) : (
          <View className={style.empty}>{emptyText}</View>
        )}

        {data.length > 0 && (
          <View className={style['loading-more']}>
            {loading ? (
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