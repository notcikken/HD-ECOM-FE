export interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sender_type?: string;
  sender_id?: string | number;
  isOptimistic?: boolean;
}