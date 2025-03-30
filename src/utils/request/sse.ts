import Taro from '@tarojs/taro';
import { SSEOptions } from '@/api/types/sse';
import { REQUEST_CONFIG } from './config';

let requestTask: Taro.RequestTask<any> | null = null;

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

  requestTask = Taro.request({
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
      requestTask?.abort?.();
      if (sseOptions.onError) {
        sseOptions.onError(error.errMsg);
      }
      requestTask = null;
    },
    complete() {
      if (sseOptions.onComplete) {
        sseOptions.onComplete(result);
      }
      requestTask?.abort?.(); // 延迟关闭连接，确保所有处理完成
      requestTask = null;
    },
  });

  requestTask?.onChunkReceived?.((response) => {
    // 避免已完成的流继续处理
    if (isStreamDone) return;

    const arrayBuffer = response.data;
    const uint8Array = new Uint8Array(arrayBuffer);

    // 不使用 TextDecoder，改用小程序支持的方法处理字符串
    // 将 Uint8Array 转为字符串
    let text = '';
    try {
      // 尝试使用 Taro 提供的编码方法
      text = uint8ArrayToString(uint8Array);
    } catch (error) {
      console.error('字符串转换失败:', error);
      return;
    }

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

// Uint8Array 转字符串的辅助函数
function uint8ArrayToString(uint8Array: Uint8Array): string {
  let result = '';
  for (let i = 0; i < uint8Array.length; i++) {
    result += String.fromCharCode(uint8Array[i]);
  }
  return decodeURIComponent(escape(result));
}
