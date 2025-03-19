export interface MessageDTO {
  chatId?: string;
  id?: string;
  chatting?: boolean;
  message: string;
  sender: string;
}
export interface ChatHistoryDTO {
  chatId: string;
  date: string;
  desc: string;
  image: string;
  message: string;
  tags: string[];
  title: string;
  week: string;
  messages: MessageDTO[];
}

export interface ChatMessageDTO {
  chatId?: string;
  message: string;
  sender: 'ai' | 'user';
}
export interface NewMessageDTO {
  message: string;
  title: string;
}
