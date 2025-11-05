/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Ticket } from "~/types/ticket";
import ticketsData from "~/data/tickets.json";

interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  role?: "pelanggan" | "penjual";
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const useTicketApi = () => {
  // Simulate API delay
  const delay = (ms: number = 500) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * GET /api/tickets
   * Fetch all tickets with optional filters
   */
  const fetchTickets = async (
    filters?: TicketFilters
  ): Promise<ApiResponse<Ticket[]>> => {
    await delay(300);

    try {
      let tickets: Ticket[] = [];

      // Get tickets based on role - with type assertion
      if (filters?.role === "pelanggan") {
        tickets = ticketsData.pelanggan as Ticket[];
      } else if (filters?.role === "penjual") {
        tickets = ticketsData.penjual as Ticket[];
      } else {
        // Get all tickets
        tickets = [
          ...(ticketsData.pelanggan as Ticket[]),
          ...(ticketsData.penjual as Ticket[]),
        ];
      }

      // Apply filters
      if (filters) {
        tickets = tickets.filter((ticket) => {
          if (filters.status && ticket.status !== filters.status) return false;
          if (filters.priority && ticket.priority !== filters.priority)
            return false;
          if (filters.category && ticket.category !== filters.category)
            return false;
          return true;
        });
      }

      return {
        success: true,
        data: tickets,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: "Failed to fetch tickets",
      };
    }
  };

  /**
   * GET /api/tickets/:id
   * Fetch a single ticket by ID
   */
  const fetchTicketById = async (
    id: string
  ): Promise<ApiResponse<Ticket | null>> => {
    await delay(300);

    try {
      const allTickets = [
        ...(ticketsData.pelanggan as Ticket[]),
        ...(ticketsData.penjual as Ticket[]),
      ];
      const ticket = allTickets.find((t) => t.id === id);

      if (!ticket) {
        return {
          success: false,
          data: null,
          message: "Ticket not found",
        };
      }

      return {
        success: true,
        data: ticket,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: "Failed to fetch ticket",
      };
    }
  };

  /**
   * GET /api/tickets/stats
   * Fetch ticket statistics
   */
  const fetchTicketStats = async () => {
    await delay(300);

    try {
      const allTickets = [
        ...(ticketsData.pelanggan as Ticket[]),
        ...(ticketsData.penjual as Ticket[]),
      ];

      const stats = {
        total: allTickets.length,
        open: allTickets.filter((t) => t.status === "open").length,
        inProgress: allTickets.filter((t) => t.status === "in-progress").length,
        resolved: allTickets.filter((t) => t.status === "resolved").length,
        closed: allTickets.filter((t) => t.status === "closed").length,
        urgent: allTickets.filter((t) => t.priority === "urgent").length,
        high: allTickets.filter((t) => t.priority === "high").length,
        medium: allTickets.filter((t) => t.priority === "medium").length,
        low: allTickets.filter((t) => t.priority === "low").length,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: "Failed to fetch statistics",
      };
    }
  };

  /**
   * POST /api/tickets
   * Create a new ticket (mock)
   */
  const createTicket = async (
    ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Ticket>> => {
    await delay(500);

    try {
      const newTicket: Ticket = {
        ...ticket,
        id: `TKT-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: newTicket,
        message: "Ticket created successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Ticket,
        message: "Failed to create ticket",
      };
    }
  };

  /**
   * PUT /api/tickets/:id
   * Update a ticket (mock)
   */
  const updateTicket = async (
    id: string,
    updates: Partial<Ticket>
  ): Promise<ApiResponse<Ticket>> => {
    await delay(500);

    try {
      const ticketResponse = await fetchTicketById(id);

      if (!ticketResponse.success || !ticketResponse.data) {
        return {
          success: false,
          data: {} as Ticket,
          message: "Ticket not found",
        };
      }

      const updatedTicket: Ticket = {
        ...ticketResponse.data,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: updatedTicket,
        message: "Ticket updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Ticket,
        message: "Failed to update ticket",
      };
    }
  };

  /**
   * DELETE /api/tickets/:id
   * Delete a ticket (mock)
   */
  const deleteTicket = async (id: string): Promise<ApiResponse<boolean>> => {
    await delay(500);

    try {
      const ticketResponse = await fetchTicketById(id);

      if (!ticketResponse.success || !ticketResponse.data) {
        return {
          success: false,
          data: false,
          message: "Ticket not found",
        };
      }

      return {
        success: true,
        data: true,
        message: "Ticket deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        message: "Failed to delete ticket",
      };
    }
  };

  return {
    fetchTickets,
    fetchTicketById,
    fetchTicketStats,
    createTicket,
    updateTicket,
    deleteTicket,
  };
};
