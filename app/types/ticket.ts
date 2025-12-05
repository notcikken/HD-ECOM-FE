export type TicketStatus = "open" | "in-progress" | "resolved";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketRole = "pelanggan" | "penjual";

export interface Ticket {
  id_ticket: string;
  kode_tiket: string;
  judul: string;
  deskripsi: string;
  id_status: number;
  status: string;
  username: string;
  id_priority: number;
  priority: TicketPriority | null; // null untuk status open
  role: TicketRole;
  tipe_pengaduan: string;
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
