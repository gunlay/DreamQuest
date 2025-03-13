import dayjs from "dayjs";
import { View, Input, Image } from "@tarojs/components";
import { FC, useState } from "react";
import { DreamCardDTO, DreamCardVO, MonthDreams } from "@/api/types/record";
import { recordApi } from "@/api/record";
import Search from "@/assets/icon/search.png";
import List from "@/Components/List";
import DreamCard from "../DreamCard";
import style from "./index.module.scss";

const ListView: FC = () => {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const pageSize = 5;
  
  const onSearchInput = (e: any) => {
    setSearchKeyword(e.detail.value);
  };
  
  const clearSearch = () => {
    setSearchKeyword("");
    load({ pageIndex: 1, pageSize });
  };
  
  const search = async () => {
    if (!searchKeyword?.trim()) {
      return;
    }
    load({ pageIndex: 1, pageSize });
  };

  const processAndGroupDreams = (list: DreamCardDTO[]): MonthDreams[] => {
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

  const load = async (params: {pageIndex: number, pageSize: number} ) => {
    const { list, total } = await recordApi.fetchDreamList({
      pageParam: params,
      keyword: searchKeyword?.trim() || undefined
    });

    return {
      list: processAndGroupDreams(list),
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

      <List<MonthDreams>
        // height='90vh'
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
  );
};

export default ListView;
