export interface Conversation {
  id: number;
  customerId: number;
  adminId: number;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
  customerName: string;
  customerEmail: string;
}
