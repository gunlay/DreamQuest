import { http } from '@/utils/request/index'

interface UserInfo {
  id: number
  name: string
  avatar: string
}

export const userApi = {
  // 获取用户信息
  getUserInfo: () => {
    return http.get<UserInfo>('/user/info')
  },
  
  // 更新用户信息
  updateUserInfo: (data: Partial<UserInfo>) => {
    return http.put<UserInfo>('/user/info', data)
  }
} 