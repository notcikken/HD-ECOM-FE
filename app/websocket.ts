interface WebSocketMessage {
  type: string;
  payload?: {
    text?: string;
    message_text?: string; // Added for backend compatibility
    conversation_id?: string | number;
    is_typing?: boolean;
    sender_type?: string;
    created_at?: string;
    id?: number;
    [key: string]: any;
  };
  // For message history
  messages?: Array<{
    id: number | string;
    message?: string;
    text?: string;
    message_text?: string; // Added for backend compatibility
    sender_type: string;
    sender_id?: number;
    conversation_id?: number;
    created_at: string;
    is_read?: boolean;
    read_at?: string;
    [key: string]: any;
  }>;
  count?: number;
  conversation_id?: string | number;
  // Other fields
  user_id?: string;
  status?: string;
  message?: string;
  message_text?: string; // Added for backend compatibility
  text?: string;
  userId?: string;
  timestamp?: string;
  isTyping?: boolean;
  sender_type?: string;
  sender_id?: number;
  created_at?: string;
  id?: number;
  [key: string]: any;
}

// ...rest of the code remains the same...
