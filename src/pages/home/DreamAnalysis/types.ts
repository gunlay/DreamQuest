export interface DreamAnalysisProps {
  visible: boolean;
  dreamData: DreamData;
  onClose: () => void;
}

export interface DreamData {
  id: number;
  title?: string;
  content: string;
  date?: string;
  tags?: string[];
  createdAt: string;
}

export interface Message {
  type: 'ai' | 'user';
  content: string;
}

export interface DreamAnalysisState {
  messages: Message[];
} 