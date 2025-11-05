export type TicketStatus = "open" | "in-progress" | "resolved";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketRole = "pelanggan" | "penjual";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority | null; // null untuk status open
  role: TicketRole;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string; // Nama pegawai, bukan email
  category: string;
  resolvedAt?: string;
  resolution?: string; // Solusi yang diberikan saat resolve
  supportingDocuments?: string[]; // Array nama file
}
