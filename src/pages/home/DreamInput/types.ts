export interface DreamInputProps {
  show: boolean;
  onSave: (dreamData: DreamData) => void;
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
  mood: string;
  tags: string[];
  isSubmitting: boolean;
}