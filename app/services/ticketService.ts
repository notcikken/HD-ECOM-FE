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
   * Create new ticket
   */
  async createTicket(
    ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt">
  ): Promise<Ticket> {
    const config = useRuntimeConfig();
    const response = await $fetch<{ data: Ticket } | Ticket>(
      `${config.public.apiBase}/api/tickets`,
      {
        method: "POST",
        body: ticket,
      }
    );

    return "data" in response ? response.data : response;
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
};
