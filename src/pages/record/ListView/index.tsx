import dayjs from "dayjs";
import { View, Input, Image } from "@tarojs/components";
import { FC, useState } from "react";
import { DreamCardDTO, DreamCardVO, MonthDreams } from "@/api/types/record";
import { recordApi } from "@/api/record";
import { useSystemStore } from "@/store/systemStore";
import Search from "@/assets/icon/search.png";
import List from "@/Components/List";
import DreamCard from "../DreamCard";
import style from "./index.module.scss";


const ListView: FC = () => {
  const {appBarHeight} = useSystemStore()
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [key, setKey] = useState<number>(0);
  const pageSize = 5;
  
  const onSearchInput = (e: any) => {
    setSearchKeyword(e.detail.value);
  };
  
  const clearSearch = async () => {
    setSearchKeyword("");
    await load({ pageIndex: 1, pageSize });
    setKey(prev => prev + 1);
  };
  
  const search = async () => {
    if (!searchKeyword?.trim()) {
      return;
    }
    await load({ pageIndex: 1, pageSize });
    setKey(prev => prev + 1);
  };

  const processAndGroupDreams = (
    list: DreamCardDTO[], 
    originData?: MonthDreams[]
  ): MonthDreams[] => {
    return Object.entries(list.map(dto => ({
        ...dto,
        date: dayjs(dto.createTime).format('YYYY.MM.DD'),
        weekday: `周${['日', '一', '二', '三', '四', '五', '六'][dayjs(dto.createTime).day()]}`
        }))
        .reduce((grouped, dream) => {
          const month = dayjs(dream.createTime).format('M');
          (grouped[month] = grouped[month] || []).push(dream);
          return grouped;
      }, {} as { [key: string]: DreamCardVO[] }))
      .sort(([a], [b]) => Number(b) - Number(a))
      .flatMap(([month, dreams]) => [
        { type: 'header', month, dream: {} as DreamCardVO },
        ...dreams.map(dream => ({ type: 'dream', month: '', dream }))
      ]);
  };

  const load = async (params: {
    pageIndex: number, 
    pageSize: number
  }, originData?: MonthDreams[]) => {
    const { list, total } = await recordApi.fetchDreamList({
      pageParam: params,
      message: searchKeyword?.trim() || undefined
    });

    return {
      list: processAndGroupDreams(list, originData),
      total
    };
  };

  return (
    <View className={style["list-view"]}>
      <View className={style["search-area"]}>
        <View className={style["search-input-wrapper"]}>
          <Image
            className={style["search-icon"]}
            src={Search}
            mode="aspectFit"
          />
          <Input
            className={style["search-input"]}
            placeholder="Search"
            placeholder-style="color: rgba(0, 0, 0, 0.3)"
            value={searchKeyword}
            onInput={onSearchInput}
          />
          {searchKeyword ? (
            <View className={style["clear-icon"]} onClick={clearSearch}>
              ×
            </View>
          ) : null}
        </View>
        <View className={style["search-btn"]} onClick={search}>
          搜索
        </View>
      </View>

      <View className={style.list}>
        <List<MonthDreams>
          key={key}
          height={`calc(100vh - 118px - ${appBarHeight}px)`}
          pageSize={pageSize}
          onLoadMore={load}
          renderItem={(item: MonthDreams) => {
            if (item.type === 'header') {
              return <View className={style["month-title"]}>{item.month} 月</View>;
            } else {
              return <DreamCard dream={item.dream} key={item.dream.id} />;
            }
          }}
          emptyText={searchKeyword ? "没有找到相关梦境" : "暂无梦境记录"}
        />
      </View>
    </View>
  );
};

export default ListView;
