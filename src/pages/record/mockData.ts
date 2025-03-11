import { DreamCardDTO } from "@/api/types/record";

// 生成15条模拟数据
export const mockDreamList: DreamCardDTO[] = [
  {
    id: 1,
    title: "飞翔的梦",
    content: "我梦见自己在天空中自由飞翔，俯瞰大地，感觉非常自由和放松。",
    createTime: "2023-05-15 08:30:00",
    updateTime: "2023-05-15 08:30:00",
    createBy: "user1",
    updateBy: "user1",
    image: "https://picsum.photos/300/200?random=1",
    tags: ["飞翔", "自由", "天空"],
    descri: "一个关于飞翔的美梦",
    isDeleted: false
  },
  {
    id: 2,
    title: "追逐的梦",
    content: "我梦见自己在一个迷宫中奔跑，似乎在追逐什么，又像是在逃避什么。",
    createTime: "2023-05-20 22:15:00",
    updateTime: "2023-05-20 22:15:00",
    createBy: "user1",
    updateBy: "user1",
    image: "https://picsum.photos/300/200?random=2",
    tags: ["追逐", "迷宫", "奔跑"],
    descri: "一个关于追逐的梦",
    isDeleted: false
  },
  {
    id: 3,
    title: "海洋的呼唤",
    content: "我梦见自己站在海边，听到海洋在呼唤我，波浪轻轻拍打着沙滩，非常宁静。",
    createTime: "2023-06-05 23:45:00",
    updateTime: "2023-06-05 23:45:00",
    createBy: "user1",
    updateBy: "user1",
    image: "https://picsum.photos/300/200?random=3",
    tags: ["海洋", "宁静", "呼唤"],
    descri: "一个关于海洋的梦",
    isDeleted: false
  },
  {
    id: 4,
    title: "古老的城堡",
    content: "我梦见自己在一座古老的城堡中探险，城堡里有很多神秘的房间和走廊。",
    createTime: "2023-06-10 21:30:00",
    updateTime: "2023-06-10 21:30:00",
    createBy: "user1",
    updateBy: "user1",
    image: "https://picsum.photos/300/200?random=4",
    tags: ["城堡", "探险", "神秘"],
    descri: "一个关于探险的梦",
    isDeleted: false
  }
];