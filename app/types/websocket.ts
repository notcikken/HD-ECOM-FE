export interface WebSocketMessage {
  type: string;
  payload?: {
    text?: string;
    conversation_id?: string | number;
    is_typing?: boolean;
    [key: string]: any;
  };
  message?: string;
  userId?: string;
  timestamp?: string;
  [key: string]: any;
}
