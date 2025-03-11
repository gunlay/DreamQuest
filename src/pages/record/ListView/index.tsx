import dayjs from "dayjs";
import { View, Input, Image } from "@tarojs/components";
import { FC, useState } from "react";
import { DreamCardVO, MonthDreams } from "@/api/types/record";
import { recordApi } from "@/api/record";
import Search from "@/assets/icon/search.png";
import List from "@/Components/List";
import DreamCard from "../DreamCard";
import style from "./index.module.scss";

const ListView: FC = () => {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const pageSize = 10;
  
  const onSearchInput = (e: any) => {
    setSearchKeyword(e.detail.value);
  };
  
  const clearSearch = () => {
    setSearchKeyword("");
    load({ pageIndex: 1, pageSize: 10 });
  };
  
  const search = async () => {
    if (!searchKeyword?.trim()) {
      return;
    }
    load({ pageIndex: 1, pageSize: 10 });
  };

  const groupDreamsByMonth = (dreams: DreamCardVO[]): MonthDreams[] => {
    const grouped: { [key: string]: DreamCardVO[] } = {};

    dreams.forEach((dream) => {
      const month = parseInt(dream.date.split(".")[1], 10).toString();
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(dream);
    });

    return Object.keys(grouped)
      .sort((a, b) => Number(b) - Number(a))
      .map((month) => ({
        month,
        dreams: grouped[month],
      }));
  };

  const load = async (params: { pageIndex: number, pageSize: number }) => {
    const { list, total } = await recordApi.fetchDreamList({
      pageParam: params,
      keyword: searchKeyword?.trim() || undefined
    });

    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    const formattedDreams = list.map(dto => {
      const date = dayjs(dto.createTime);
      return {
        ...dto,
        date: date.format('YYYY.MM.DD'),
        weekday: weekdays[date.day()],
      };
    });

    const groupedDreams = groupDreamsByMonth(formattedDreams);

    return {
      list: groupedDreams.flatMap(monthGroup => [
        { type: 'header', month: monthGroup.month, dream: {} as DreamCardVO },
        ...monthGroup.dreams.map(dream => ({ type: 'dream', month: '', dream }))
      ]),
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

      <List<string[]>
        pageSize={pageSize}
        onLoadMore={load}
        renderItem={(item: any) => {
          if (item.type === 'header') {
            return <View className={style["month-title"]}>{item.month} 月</View>;
          } else if (item.dream.id) {
            return <DreamCard dream={item.dream} key={item.dream.id} />;
          }
          return null;
        }}
        emptyText={searchKeyword ? "没有找到相关梦境" : "暂无梦境记录"}
      />
    </View>
  );
};

export default ListView;
