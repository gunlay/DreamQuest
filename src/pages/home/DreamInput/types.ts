export interface DreamInputProps {
  show: boolean;
  onClose: () => void;
}

export interface DreamData {
  id: number;
  content: string;
  title?: string;
  mood?: string;
  tags?: string[];
  createdAt: string;
}

export interface DreamInputState {
  content: string;
  title: string;
  currentDate: string;
}
