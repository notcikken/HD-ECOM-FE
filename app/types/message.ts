export interface Message {
  id: number;
  conversationId?: number;
  senderId: number;
  text: string;
  createdAt: Date;
}

export interface UserMessage extends Message {
  sender: "customer" | "admin";
}

export interface MessageHistory {
  messages: UserMessage[];
  nextCursor?: string | null;
  limit: number;
}
