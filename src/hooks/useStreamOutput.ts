import { useState, useCallback, useRef, useEffect } from 'react';

export const useStreamOutput = (props: {
  setMessage: (message: string, chatId: string) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<string>('');
  const chatIdRef = useRef<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // 更新消息内容
  const updateMessage = useCallback(() => {
    if (contentRef.current && props.setMessage) {
      props.setMessage(contentRef.current, chatIdRef.current);
    }
  }, [props]);

  const onChunkReceived = useCallback(
    (chunk: string): string => {
      setLoading(false);
      try {
        // 检查是否是空字符串
        if (!chunk || chunk.trim() === '') return '';

        // 处理数据
        const lines = chunk
          .split('\n')
          .filter((line) => line.trim())
          .map((line) => {
            if (line.startsWith('id:')) return '';
            // 移除特殊字符
            return line.replace(/data:/g, '').trim();
          })
          .filter(Boolean);

        // 将所有行连接起来
        const content = lines.join('');
        if (content) {
          // 添加到内容中
          contentRef.current += content;

          // 立即更新UI
          updateMessage();
        }

        return content;
      } catch (e) {
        console.error('Failed to process chunk:', e);
        return '';
      }
    },
    [updateMessage]
  );

  const onStreamError = useCallback(
    (err: string) => {
      setError(err);
      setLoading(false);
      // 确保在错误时更新最终内容
      updateMessage();
    },
    [updateMessage]
  );

  const onStreamComplete = useCallback(() => {
    // 流结束时进行最后一次更新
    updateMessage();
  }, [updateMessage]);

  const startStream = useCallback((chatId: string) => {
    setLoading(true);
    setError(null);
    // 清空内容
    contentRef.current = '';
    chatIdRef.current = chatId;
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
    contentRef.current = '';
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    loading,
    buffer: contentRef.current,
    error,
    startStream,
    onChunkReceived,
    onStreamError,
    onStreamComplete,
    reset,
  };
};
