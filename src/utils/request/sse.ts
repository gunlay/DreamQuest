import Taro from '@tarojs/taro';
import { REQUEST_CONFIG } from './config';

// SSE 请求方法
export const createSSEConnection = (
  _url: string,
  params: Record<string, string>,
  onChunkReceived: (chunk: string) => void,
  onError?: (error: any) => void
) => {
  const url = new URL(_url, REQUEST_CONFIG.baseURL);
  Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

  const requestTask = Taro.request({
    url: url.toString(),
    method: 'GET',
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: Taro.getStorageSync('auth_token'),
    },
    enableChunked: true, // 启用分块传输，关键属性，仅微信小程序支持
    success: () => {
      console.log('Request completed');
      requestTask.abort(); // 请求完成后主动断开连接
    },
    fail: (error) => {
      console.error('Request failed', error);
      if (onError) {
        onError(error);
      }
    },
  });

  requestTask.onChunkReceived((response) => {
    const arrayBuffer = response.data;
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64Str = Taro.arrayBufferToBase64(uint8Array);

    const bytes = Taro.base64ToArrayBuffer(base64Str);
    const text = new TextDecoder().decode(bytes); // 可能需要 polyfill

    const textArr = text.trim().split('\n');
    textArr.forEach(onChunkReceived);
  });

  return requestTask;
};
