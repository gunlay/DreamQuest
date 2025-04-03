import { View, Input, Image, ITouchEvent } from '@tarojs/components';
import { FC, useEffect, useState } from 'react';
import { recordApi } from '@/api/record';
import { DreamCardDTO, MonthDreams } from '@/api/types/record';
import Search from '@/assets/icon/search.png';
import List from '@/Components/List';
import { useChatStore } from '@/store/chatStore';
import { useSystemStore } from '@/store/systemStore';
import DreamCard from '../DreamCard';
import style from './index.module.scss';

const ListView: FC = () => {
  const { appBarHeight } = useSystemStore();
  const { dreamInput } = useChatStore();
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [key, setKey] = useState<number>(0);
  const pageSize = 5;

  const onSearchInput = (e: ITouchEvent) => {
    setSearchKeyword(e.detail.value);
  };

  const clearSearch = async () => {
    setSearchKeyword('');
    await load({ pageIndex: 1, pageSize });
    setKey((prev) => prev + 1);
  };

  const search = async () => {
    if (!searchKeyword?.trim()) {
      return;
    }
    await load({ pageIndex: 1, pageSize });
    setKey((prev) => prev + 1);
  };

  const processAndGroupDreams = (
    list: DreamCardDTO[],
    originData?: MonthDreams[]
  ): MonthDreams[] => {
    // 计算出originData中包含了那些month
    const originMonths = originData?.map((item) => item.month) || [];

    return Object.entries(
      list.reduce(
        (grouped, dream) => {
          const month = dream.date.split('.')[1];
          (grouped[month] = grouped[month] || []).push(dream);
          return grouped;
        },
        {} as { [key: string]: DreamCardDTO[] }
      )
    )
      .sort(([a], [b]) => Number(b) - Number(a))
      .flatMap(([month, dreams]) => {
        return [
          !originMonths?.length ||
          originMonths.findIndex((o) => o === month) === -1 ||
          month === originData?.[0].month
            ? { type: 'header', month, dream: {} as DreamCardDTO }
            : null,
          ...dreams.map((dream) => ({ type: 'dream', month: '', dream })),
        ];
      })
      .filter(Boolean) as MonthDreams[];
  };

  const load = async (
    params: {
      pageIndex: number;
      pageSize: number;
    },
    originData?: MonthDreams[]
  ) => {
    const { list, total } = await recordApi.fetchDreamList({
      pageParam: params,
      message: searchKeyword?.trim() || undefined,
    });

    return {
      list: processAndGroupDreams(list, originData),
      total,
    };
  };

  useEffect(() => {}, [dreamInput]);

  return (
    <View className={style['list-view']}>
      <View className={style['search-area']}>
        <View className={style['search-input-wrapper']}>
          <Image className={style['search-icon']} src={Search} mode="aspectFit" />
          <Input
            className={style['search-input']}
            placeholder="Search"
            placeholder-style="color: rgba(0, 0, 0, 0.3)"
            value={searchKeyword}
            onInput={onSearchInput}
          />
          {searchKeyword ? (
            <View className={style['clear-icon']} onClick={clearSearch}>
              ×
            </View>
          ) : null}
        </View>
        <View className={style['search-btn']} onClick={search}>
          搜索
        </View>
      </View>

      <View className={style.list}>
        <List<MonthDreams>
          key={key}
          height={`calc(100vh - 118px - ${appBarHeight}px)`}
          pageSize={pageSize}
          onLoadMore={load}
          // renderTop={() => {
          //   return <View className={style.creating}>梦境对话解析中</View>;
          // }}
          renderItem={(item: MonthDreams) => {
            if (item.type === 'header') {
              return <View className={style['month-title']}>{item.month} 月</View>;
            } else {
              return <DreamCard dream={item.dream} key={item.dream.chatId} />;
            }
          }}
          emptyText={searchKeyword ? '没有找到相关梦境' : '暂无梦境记录'}
        />
      </View>
    </View>
  );
};

export default ListView;
