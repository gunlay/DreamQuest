export interface MessageDTO {
  chatId?: string
  id?: string
  message: string
  sender: string
}
export interface ChatHistoryDTO {
  chatId: string;
  date: string;
  desc: string
  image: string;
  message: string
  tags: string[];
  title: string;
  week: string;
  messages: MessageDTO[]
}
