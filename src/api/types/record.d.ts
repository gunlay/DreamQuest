export interface DreamCardDTO {
  content: string
  createBy: string
  createTime: string
  desc: string
  id:	number
  image: string
  isDeleted: boolean
  tags: string[]
  title: string
  updateBy:	string
  updateTime: string
} 
export interface DreamCardVO {
  chatId?: string
  content: string
  date: string
  weekday: string
  desc: string
  id:	number
  image: string
  isDeleted: boolean
  tags: string[]
  title: string
}
export interface MonthDreams {
  type: string;
  month: string;
  dream: DreamCardVO;
}

export interface ReocrdHistoryDTO {
  content: string	
  createBy: string	
  createTime: string	
  desc: string	
  id:	number	
  image: string	
  isDeleted: boolean	
  title: string	
  updateBy:	string
  updateTime: string
  list: DreamCardDTO[]
  total: number
}