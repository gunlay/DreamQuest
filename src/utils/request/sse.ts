import Taro from '@tarojs/taro';
import { SSEOptions } from '@/api/types/sse';
import { REQUEST_CONFIG } from './config';

// SSE 请求方法
export const createSSEConnection = (
  method: 'GET' | 'POST',
  _url: string,
  params: Record<string, string | number>,
  sseOptions: SSEOptions
) => {
  const result: string[] = [];
  const url = new URL(_url, REQUEST_CONFIG.baseURL);
  const contentType = method === 'POST' ? 'application/json' : 'application/x-www-form-urlencoded';
  Object.keys(params).forEach((key) => url.searchParams.append(key, params[key] as string));

  // 标记流是否已完成
  let isStreamDone = false;
  let timer: NodeJS.Timeout | null = null;

  const requestTask = Taro.request({
    url: url.toString(),
    method: method,
    header: {
      'content-type': contentType,
      Authorization: Taro.getStorageSync('auth_token'),
    },
    data: params,
    enableChunked: true, // 启用分块传输，关键属性，仅微信小程序支持
    success: () => {
      isStreamDone = true;
    },
    fail: (error) => {
      isStreamDone = true;
      requestTask.abort();
      if (sseOptions.onError) {
        sseOptions.onError(error.errMsg);
      }
    },
    complete() {
      if (sseOptions.onComplete) {
        sseOptions.onComplete(result);
      }
      timer = setTimeout(() => {
        requestTask.abort(); // 延迟关闭连接，确保所有处理完成
        timer = null;
      }, 300);
    },
  });

  requestTask.onChunkReceived((response) => {
    // 避免已完成的流继续处理
    if (isStreamDone) return;

    const arrayBuffer = response.data;
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64Str = Taro.arrayBufferToBase64(uint8Array);

    const bytes = Taro.base64ToArrayBuffer(base64Str);
    const text = new TextDecoder().decode(bytes);

    const textArr = text.trim().split('\n');
    textArr.forEach((chunk) => {
      if (chunk && chunk.trim()) {
        const r = sseOptions.onChunkReceived?.(chunk);
        if (r) result.push(r);
      }
    });
  });

  return requestTask;
};
