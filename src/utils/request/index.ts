import Taro from '@tarojs/taro';
import { navigateToLogin } from '../navigate';
import { REQUEST_CONFIG, HTTP_STATUS } from './config';

// 定义响应接口
interface ResponseData<T = unknown> {
  code: number;
  data: T;
  message: string;
}

// 定义请求配置接口
interface RequestOptions extends Omit<Taro.request.Option, 'success' | 'fail'> {
  retries?: number;
  showLoading?: boolean;
  sse?: boolean;
}

export class HttpRequest {
  private static instance: HttpRequest;
  private constructor() {}

  static getInstance(): HttpRequest {
    if (!HttpRequest.instance) {
      HttpRequest.instance = new HttpRequest();
    }
    return HttpRequest.instance;
  }

  // 请求拦截器
  private requestInterceptor(options: RequestOptions): RequestOptions {
    // 添加token
    const token = Taro.getStorageSync('auth_token');
    console.log(options);

    const header = {
      'content-type': 'application/json',
      ...options.header,
    };

    if (token) {
      header['Authorization'] = token;
    }

    if (options.sse) {
      header['content-type'] = 'application/x-www-form-urlencoded';
      header['Connection'] = 'keep-alive';
      header['Cache-Control'] = 'no-cache';
      header['Accept'] = 'text/event-stream';
      options.enableChunked = true; // 启用流式接收（部分小程序支持）
    }

    return {
      ...options,
      header,
      url: REQUEST_CONFIG.baseURL + options.url,
    };
  }

  // 响应拦截器
  private responseInterceptor(response: Taro.request.SuccessCallbackResult<ResponseData>) {
    const { statusCode, data } = response;

    // 请求成功
    if ([HTTP_STATUS.SUCCESS, HTTP_STATUS.ACCEPTED, HTTP_STATUS.ACCEPTED].includes(statusCode)) {
      if (data.code === 0) {
        return data.data;
      }
      // 业务错误处理
      this.handleBusinessError(data);
      return Promise.reject(data);
    }

    // HTTP 错误处理
    this.handleHttpError(statusCode);
    return Promise.reject(response);
  }

  // 业务错误处理
  private handleBusinessError(data: ResponseData) {
    switch (data.code) {
      case 401:
        // token过期，清除登录信息
        // Taro.clearStorageSync();
        navigateToLogin();
        break;
      default:
        Taro.showToast({
          title: data.message || '请求失败',
          icon: 'none',
          duration: 2000,
        });
    }
  }

  // HTTP错误处理
  private handleHttpError(statusCode: number) {
    let message = '服务器错误';

    switch (statusCode) {
      case HTTP_STATUS.NOT_FOUND:
        message = '请求的资源不存在';
        break;
      case HTTP_STATUS.FORBIDDEN:
        message = '没有权限访问';
        break;
      case HTTP_STATUS.SERVER_ERROR:
        message = '服务器错误';
        break;
      case HTTP_STATUS.BAD_GATEWAY:
        message = '网关错误';
        break;
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        message = '服务不可用';
        break;
      case HTTP_STATUS.GATEWAY_TIMEOUT:
        message = '网关超时';
        break;
    }

    Taro.showToast({
      title: message,
      icon: 'none',
      duration: 2000,
    });
  }

  // 发起请求
  async request<T>(options: RequestOptions): Promise<T> {
    const { showLoading = true, retries = 0 } = options;

    try {
      // 应用请求拦截器
      const interceptedOptions = this.requestInterceptor({
        ...options,
        data: options.data || {},
      });

      const response = await Taro.request<ResponseData<T>>({
        ...interceptedOptions,
        timeout: REQUEST_CONFIG.timeout,
      });

      // 应用响应拦截器
      return this.responseInterceptor(response);
    } catch (error) {
      // 请求失败且还有重试次数时进行重试
      if (retries < REQUEST_CONFIG.maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, REQUEST_CONFIG.retryDelay));
        return this.request({
          ...options,
          retries: retries + 1,
          showLoading: false,
        });
      }
      throw error;
    } finally {
      if (showLoading) {
        Taro.hideLoading();
      }
    }
  }

  // 封装常用请求方法
  get<T>(url: string, data?: any, options?: Partial<RequestOptions>) {
    return this.request<T>({
      method: 'GET',
      url,
      data,
      ...options,
    });
  }

  post<T>(url: string, data?: any, options?: Partial<RequestOptions>) {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...options,
    });
  }

  put<T>(url: string, data?: any, options?: Partial<RequestOptions>) {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...options,
    });
  }

  delete<T>(url: string, data?: any, options?: Partial<RequestOptions>) {
    return this.request<T>({
      method: 'DELETE',
      url,
      data,
      ...options,
    });
  }
}

export const http = HttpRequest.getInstance();
