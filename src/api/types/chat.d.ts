export interface ChatHistoryDTO {
  chatId: string	
  createBy: string	
  createTime: string
  id:		number
  isDeleted:		boolean	
  message: string	
  sender: string	
  sequence: number
  updateBy: string	
  updateTime: string
}

export interface ChatStatiticDTO {
  moreDate: string,
  num: number
}