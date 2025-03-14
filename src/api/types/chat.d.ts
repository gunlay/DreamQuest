export interface ChatHistoryDTO {
  chatId: string;
  createBy: string;
  createTime: string;
  id: number;
  tags: string[];
  title: string;
  week: string;
  image: string
  isDeleted: boolean;
  message: string;
  messages: {
    chatId: string
    id: string
    message: string
    sender: string
  }[]
  sender: string;
  sequence: number;
  updateBy: string;
  updateTime: string;
}
