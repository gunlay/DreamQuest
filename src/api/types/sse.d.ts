export interface SSEOptions {
  startStream?: (chatId?: string) => void;
  onChunkReceived?: (chunk: string) => string;
  onError?: (error: string) => void;
  onComplete?: (result?: string[]) => void;
}
