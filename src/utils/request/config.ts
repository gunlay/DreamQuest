// 请求配置
export const REQUEST_CONFIG = {
  // 基础URL
  baseURL: "https://api.example.com",
  // 超时时间
  timeout: 10000,
  // 最大重试次数
  maxRetries: 3,
  // 重试延迟时间（毫秒）
  retryDelay: 1000,
};

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
};
// 应用配置
export const appConfig = {
  cloudStoragePath: {
    dreamImages: "dream-images/", // 梦境图片存储路径
  },
};

// API配置
export const apiConfig = {
  baseUrl: "https://dreamquest.seekly.tech", // 本地开发环境
  deepseek: {
    baseUrl: "https://api.deepseek.com",
    apiKey: "sk-276d5267971644bca803a9130d6db1ac", // DeepSeek API Key
  },
};

// 导出统一配置对象
export const config = {
  ...appConfig,
  ...apiConfig,
  deepseekApiKey: "sk-276d5267971644bca803a9130d6db1ac",
};

const API_KEY = "sk-5e355a7af3b842f1b646034657664a76";

export function getAuth() {
  return {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };
}
