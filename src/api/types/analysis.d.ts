export interface Message {
  type: "ai" | "user";
  content: string;
  id?: string;
}

export interface ChatDreamAnalysisDTO {
  tags: string[]
  messages: Message[]
}