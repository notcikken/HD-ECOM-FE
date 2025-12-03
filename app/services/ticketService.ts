import type { Ticket, TicketPriority } from "~/types/ticket";

interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  role?: "pelanggan" | "penjual";
}

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  urgent: number;
  high: number;
  medium: number;
  low: number;
}

interface TicketCategory {
  id_category: number;
  nama_category: string;
}

interface TicketAttachment {
  attachment: {
    id_attachment: number;
    id_ticket: number;
    file_path: string;
    uploaded_at: string;
  };
  download_url: string;
}

export const ticketService = {
  /**
   * Fetch tickets with optional filters
   */
  async fetchTickets(filters?: TicketFilters): Promise<Ticket[]> {
    const config = useRuntimeConfig();
    const query = new URLSearchParams();

    if (filters?.role) query.set("role", filters.role);
    if (filters?.status) query.set("status", filters.status);
    if (filters?.priority) query.set("priority", filters.priority);
    if (filters?.category) query.set("category", filters.category);

    const queryString = query.toString();
    const url = `${config.public.apiBase}/api/tickets${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await $fetch<{ data: Ticket[] } | Ticket[]>(url, {
      method: "GET",
    });

    // Handle different response structures
    return Array.isArray(response) ? response : response.data;
  },

  /**
   * Fetch single ticket by ID
   */
  async fetchTicketById(id: string): Promise<Ticket> {
    const config = useRuntimeConfig();
    const response = await $fetch<{ data: Ticket } | Ticket>(
      `${config.public.apiBase}/api/tickets/${id}`,
      { method: "GET" }
    );

    return "data" in response ? response.data : response;
  },

  /**
   * Fetch ticket statistics
   */
  async fetchTicketStats(): Promise<TicketStats> {
    const config = useRuntimeConfig();
    const response = await $fetch<{ data: TicketStats } | TicketStats>(
      `${config.public.apiBase}/api/tickets/stats`,
      { method: "GET" }
    );

    return "data" in response ? response.data : response;
  },

  /**
   * Fetch current user's tickets
   */
  async fetchMyTickets(): Promise<Ticket[]> {
    const config = useRuntimeConfig();
    const { token } = useAuth();

    const response = await $fetch<{ data: Ticket[] } | Ticket[]>(
      `${config.public.apiBase}/api/tickets/my-tickets`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    return Array.isArray(response) ? response : response.data;
  },

  /**
   * Create new ticket
   */
  async createTicket(
    ticket: {
      judul: string;
      deskripsi: string;
      id_category: number;
    }
  ): Promise<any> {
    const config = useRuntimeConfig();

    // Get the auth token from your auth composable
    const { token } = useAuth();

    const response = await $fetch<{
      status: number;
      message: string;
      data: {
        id_ticket: number;
        kode_tiket: string;
        id_user: number;
        judul: string;
        deskripsi: string;
        id_category: number;
        id_priority: number;
        id_status: number;
        tipe_pengaduan: string;
        tanggal_dibuat: string;
        tanggal_diperbarui: string;
      };
    }>(
      `${config.public.apiBase}/api/tickets`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token.value}`,
          "Content-Type": "application/json"
        },
        body: ticket,
      }
    );

    return response.data;
  },

  /**
   * Upload attachments for a ticket
   */
  async uploadTicketAttachments(
    ticketId: number,
    files: File[]
  ): Promise<any> {
    const config = useRuntimeConfig();
    const { token } = useAuth();

    // Upload each file separately since the API might expect one file per request
    const results = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append("id_ticket", ticketId.toString());
      formData.append("file", file);

      try {
        const response = await $fetch(
          `${config.public.apiBase}/api/ticket-attachments`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token.value}`,
            },
            body: formData,
          }
        );
        results.push(response);
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        throw error;
      }
    }

    return results;
  },

  /**
   * Create ticket with attachments
   */
  async createTicketWithAttachments(
    ticketData: {
      judul: string;
      deskripsi: string;
      id_category: number;
    },
    attachments: File[] = []
  ): Promise<any> {
    // First create the ticket
    const ticket = await this.createTicket(ticketData);
    
    // Then upload attachments if any
    if (attachments.length > 0 && ticket.id_ticket) {
      try {
        await this.uploadTicketAttachments(ticket.id_ticket, attachments);
      } catch (error) {
        console.error('Failed to upload attachments:', error);
        // Re-throw the error so the UI can handle it appropriately
        throw new Error(`Ticket created but failed to upload attachments: ${error.message}`);
      }
    }
    
    return ticket;
  },

  /**
   * Update existing ticket
   */
  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket> {
    const config = useRuntimeConfig();
    const response = await $fetch<{ data: Ticket } | Ticket>(
      `${config.public.apiBase}/api/tickets/${id}`,
      {
        method: "PATCH",
        body: updates,
      }
    );

    return "data" in response ? response.data : response;
  },

  /**
   * Delete ticket
   */
  async deleteTicket(id: string): Promise<void> {
    const config = useRuntimeConfig();
    await $fetch(`${config.public.apiBase}/api/tickets/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Assign ticket to employee with priority
   */
  async assignTicket(
    ticketId: string,
    employeeName: string,
    priority: TicketPriority
  ): Promise<Ticket> {
    const config = useRuntimeConfig();
    const response = await $fetch<{ data: Ticket } | Ticket>(
      `${config.public.apiBase}/api/tickets/${ticketId}/assign`,
      {
        method: "PATCH",
        body: {
          assignedTo: employeeName,
          priority,
        },
      }
    );

    return "data" in response ? response.data : response;
  },

  /**
   * Resolve ticket with resolution text
   */
  async resolveTicket(ticketId: string, resolution: string): Promise<Ticket> {
    const config = useRuntimeConfig();
    const response = await $fetch<{ data: Ticket } | Ticket>(
      `${config.public.apiBase}/api/tickets/${ticketId}/resolve`,
      {
        method: "PATCH",
        body: { resolution },
      }
    );

    return "data" in response ? response.data : response;
  },

  /**
   * Fetch ticket categories
   */
  async fetchTicketCategories(): Promise<TicketCategory[]> {
    const config = useRuntimeConfig();
    const response = await $fetch<{ data: TicketCategory[] } | TicketCategory[]>(
      `${config.public.apiBase}/api/ticket-categories`,
      { method: "GET" }
    );

    return Array.isArray(response) ? response : response.data;
  },

  /**
   * Fetch ticket attachments by ticket ID
   */
  async fetchTicketAttachments(ticketId: number): Promise<TicketAttachment[]> {
    const config = useRuntimeConfig();
    const { token } = useAuth();

    const response = await $fetch<{ data: TicketAttachment[] } | TicketAttachment[]>(
      `${config.public.apiBase}/api/ticket-attachments/ticket/${ticketId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    return Array.isArray(response) ? response : response.data;
  },
};
