// 请求配置
export const REQUEST_CONFIG = {
  // 基础URL
  baseURL: process.env.API_BASE_URL || 'https://api.example.com',
  // 超时时间
  timeout: 10000,
  // 最大重试次数
  maxRetries: 3,
  // 重试延迟时间（毫秒）
  retryDelay: 1000,
}

// 响应状态码
export const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 202,
  CLIENT_ERROR: 400,
  AUTHENTICATE: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} 