import { View, Input, ScrollView, Image } from "@tarojs/components";
import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import Search from "@/assets/icon/search.png";
import DreamCard from "../DreamCard";
import { DreamRecord, MonthDreams } from "../types";
import style from "./index.module.scss";

const ListView = () => {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [dreamList, setDreamList] = useState<MonthDreams[]>([]);
  const [originalDreamList, setOriginalDreamList] = useState<MonthDreams[]>([]);
  const onSearchInput = (e: any) => {
    setSearchKeyword(e.detail.value);
  };
  const clearSearch = () => {
    setSearchKeyword("");
    setDreamList(originalDreamList);
  };
  const search = () => {
    console.log("originalDreamList", originalDreamList);

    if (!searchKeyword.trim()) {
      setDreamList(originalDreamList);
      return;
    }

    const searchResult = originalDreamList
      .map((monthGroup) => ({
        month: monthGroup.month,
        dreams: monthGroup.dreams.filter(
          (dream) =>
            dream.title.includes(searchKeyword) ||
            dream.content.includes(searchKeyword) ||
            dream.tags.some((tag) => tag.includes(searchKeyword))
        ),
      }))
      .filter((monthGroup) => monthGroup.dreams.length > 0);

    setDreamList(searchResult);
  };

  const groupDreamsByMonth = (dreams: DreamRecord[]): MonthDreams[] => {
    const grouped: { [key: string]: DreamRecord[] } = {};

    dreams.forEach((dream) => {
      const month = dream.date.split(".")[1];
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

  useEffect(() => {
    const dreams = Taro.getStorageSync("dreams") || [];
    const groupedDreams = groupDreamsByMonth(dreams);
    setDreamList(groupedDreams);
    setOriginalDreamList(groupedDreams);
  }, []);

  return (
    <View className={style["list-view"]}>
      <View className={style["search-area"]}>
        <View className={style["search-input-wrapper"]}>
          <Image
            className={style["search-icon"]}
            src={Search}
            mode="aspectFit"
          ></Image>
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

      <ScrollView className={style["content-area"]} scroll-y enable-flex>
        {dreamList.map((item) => (
          <View key={item.month}>
            <View className={style["month-title"]}>{item.month} 月</View>
            {item.dreams.map((dream) => (
              <DreamCard dream={dream} key={dream.id} />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default ListView;
