import { useState, useCallback } from 'react';

// interface UseStreamOutputOptions {
//   onComplete?: () => void;
// }

export const useStreamOutput = () => {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onChunkReceived = useCallback((chunk: string) => {
    setLoading(false);
    try {
      // 检查是否是空字符串
      if (!chunk || chunk.trim() === '') return;

      // 尝试处理可能的多行数据
      const lines = chunk
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          // 移除 data: 前缀
          if (line.startsWith('data:')) {
            return line.substring(5).trim();
          }
          return line.trim();
        })
        .filter((line) => line); // 过滤掉空行

      // 将所有行连接起来
      const content = lines.join('');
      if (content) {
        setOutput((prev) => prev + content);
      }
    } catch (e) {
      console.error('Failed to process chunk:', e);
    }
  }, []);

  const onStreamError = useCallback((err: string) => {
    setError(err);
    setLoading(false);
  }, []);

  const startStream = useCallback(async () => {
    setLoading(true);
    setError(null);
    setOutput('');
    // onComplete?.();
  }, []);

  const reset = useCallback(() => {
    setOutput('');
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    output,
    error,
    startStream,
    onChunkReceived,
    onStreamError,
    reset,
  };
};
