export interface WebSocketMessage {
  type: string;
  payload: {
    conversation_id: number;
    text: string;
  };
  error?: string | null;
}
