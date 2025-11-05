/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Ticket, TicketPriority } from "~/types/ticket";
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
  const delay = (ms: number = 500) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const fetchTickets = async (
    filters?: TicketFilters
  ): Promise<ApiResponse<Ticket[]>> => {
    await delay(300);

    try {
      let tickets: Ticket[] = [];

      if (filters?.role === "pelanggan") {
        tickets = ticketsData.pelanggan as Ticket[];
      } else if (filters?.role === "penjual") {
        tickets = ticketsData.penjual as Ticket[];
      } else {
        tickets = [
          ...(ticketsData.pelanggan as Ticket[]),
          ...(ticketsData.penjual as Ticket[]),
        ];
      }

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

  const createTicket = async (
    ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Ticket>> => {
    await delay(500);

    try {
      const newTicket: Ticket = {
        ...ticket,
        id: `TKT-${Date.now()}`,
        status: "open",
        priority: null, // Priority akan diset oleh admin
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

  /**
   * Assign ticket to employee and set priority - changes status to in-progress
   */
  const assignTicket = async (
    ticketId: string,
    employeeName: string,
    priority: TicketPriority
  ): Promise<ApiResponse<Ticket>> => {
    await delay(500);

    try {
      const response = await fetchTicketById(ticketId);

      if (!response.success || !response.data) {
        return {
          success: false,
          data: {} as Ticket,
          message: "Ticket not found",
        };
      }

      if (response.data.status !== "open") {
        return {
          success: false,
          data: response.data,
          message: "Only open tickets can be assigned",
        };
      }

      const updatedTicket: Ticket = {
        ...response.data,
        status: "in-progress",
        assignedTo: employeeName,
        priority: priority,
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: updatedTicket,
        message: "Ticket assigned successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Ticket,
        message: "Failed to assign ticket",
      };
    }
  };

  /**
   * Resolve ticket with resolution text
   */
  const resolveTicket = async (
    ticketId: string,
    resolution: string
  ): Promise<ApiResponse<Ticket>> => {
    await delay(500);

    try {
      const response = await fetchTicketById(ticketId);

      if (!response.success || !response.data) {
        return {
          success: false,
          data: {} as Ticket,
          message: "Ticket not found",
        };
      }

      if (response.data.status !== "in-progress") {
        return {
          success: false,
          data: response.data,
          message: "Only in-progress tickets can be resolved",
        };
      }

      const updatedTicket: Ticket = {
        ...response.data,
        status: "resolved",
        resolution: resolution,
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: updatedTicket,
        message: "Ticket resolved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Ticket,
        message: "Failed to resolve ticket",
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
    assignTicket,
    resolveTicket,
  };
};
