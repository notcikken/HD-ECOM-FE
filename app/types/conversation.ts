import type { UserMessage } from "~/types/message";

export interface Conversation {
  id: number;
  customer_id: number;
  admin_id?: number;
  lastMessageAt: Date;
  created_at: Date;
  updated_at: Date;
}
