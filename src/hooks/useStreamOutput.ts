import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatState } from '@/store/chatStore';

export const useStreamOutput = (props: {
  getChatState: (chatId: string) => ChatState | undefined;
  setChatState: (chatId: string, state: Partial<ChatState>) => void;
  setMessage?: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<string>('');
  const chatIdRef = useRef<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  const setMessage = () => {
    console.log('updateMessage', isUnmountedRef.current, chatIdRef.current);
    if (!chatIdRef.current) return;
    const currentChatState = props.getChatState(chatIdRef.current);
    if (!currentChatState) return;

    const updateMessage = [...(currentChatState.messages || [])];

    if (updateMessage.length > 0) {
      const lastMessage = {
        ...updateMessage[updateMessage.length - 1],
        chatting: false,
        message: contentRef.current,
      };

      updateMessage[updateMessage.length - 1] = lastMessage;

      props.setChatState(chatIdRef.current, {
        ...currentChatState,
        messages: updateMessage,
      });

      if (props.setMessage) {
        props.setMessage();
      }
    }
  };

  // 清理函数
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    contentRef.current = '';
    chatIdRef.current = '';
  }, []);

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      cleanup();
    };
  }, [cleanup]);

  // 更新消息内容
  const updateMessage = useCallback(() => {
    if (isUnmountedRef.current) return;
    setMessage();
  }, [setMessage]);

  const onChunkReceived = (chunk: string): string => {
    if (isUnmountedRef.current) return '';
    setLoading(false);
    try {
      if (!chunk || chunk.trim() === '') return '';

      const lines = chunk
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          if (line.startsWith('id:')) return '';
          return line.replace(/data:/g, '').trim();
        })
        .filter(Boolean);

      const content = lines.join('');
      if (content) {
        contentRef.current += content;
        updateMessage();
      }

      return content;
    } catch (e) {
      console.error('Failed to process chunk:', e);
      return '';
    }
  };

  const onError = (err: string) => {
    if (isUnmountedRef.current) return;
    setError(err);
    setLoading(false);
    updateMessage();
  };

  const onComplete = () => {
    if (isUnmountedRef.current) return;
    // updateMessage();
    cleanup();
  };

  const startStream = (chatId: string) => {
    if (isUnmountedRef.current) return;
    setLoading(true);
    setError(null);
    cleanup();
    chatIdRef.current = chatId;
  };

  const reset = () => {
    if (isUnmountedRef.current) return;
    setError(null);
    setLoading(false);
    cleanup();
  };

  return {
    loading,
    buffer: contentRef.current,
    error,
    startStream,
    onChunkReceived,
    onError,
    onComplete,
    reset,
  };
};
