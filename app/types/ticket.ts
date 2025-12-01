export type TicketStatus = "open" | "in-progress" | "resolved";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketRole = "pelanggan" | "penjual";

export interface Ticket {
  id: string;
  kode_tiket: string;
  judul: string;
  description: string;
  id_status: number;
  status: TicketStatus;
  priority: TicketPriority | null; // null untuk status open
  role: TicketRole;
  createdBy: string;
  tanggal_dibuat: string;
  updatedAt: string;
  assignedTo?: string; // Nama pegawai, bukan email
  id_category: number;
  category: string;
  resolvedAt?: string;
  resolution?: string; // Solusi yang diberikan saat resolve
  supportingDocuments?: string[]; // Array nama file
}
