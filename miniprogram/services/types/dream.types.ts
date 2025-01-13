// 梦境图片生成服务的类型定义

// 图片生成风格
export type DreamImageStyle = 'realistic_image' | 'digital_illustration'

// 图片生成参数
export interface GenerateImageParams {
  prompt: string
  style: DreamImageStyle
  width: number
  height: number
  return_url?: boolean
} 