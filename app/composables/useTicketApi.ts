/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Ticket, TicketPriority } from "~/types/ticket";
import { ticketService } from "~/services/ticketService";

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
  const fetchTickets = async (
    filters?: TicketFilters
  ): Promise<ApiResponse<Ticket[]>> => {
    try {
      const data = await ticketService.fetchTickets(filters);
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error?.message || "Failed to fetch tickets",
      };
    }
  };

  const fetchTicketById = async (
    id: string
  ): Promise<ApiResponse<Ticket | null>> => {
    try {
      const data = await ticketService.fetchTicketById(id);
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error?.message || "Ticket not found",
      };
    }
  };

  const fetchTicketStats = async () => {
    try {
      const data = await ticketService.fetchTicketStats();
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error?.message || "Failed to fetch statistics",
      };
    }
  };

  const createTicket = async (
    ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Ticket>> => {
    try {
      const data = await ticketService.createTicket(ticket);
      return {
        success: true,
        data,
        message: "Ticket created successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as Ticket,
        message: error?.message || "Failed to create ticket",
      };
    }
  };

  const updateTicket = async (
    id: string,
    updates: Partial<Ticket>
  ): Promise<ApiResponse<Ticket>> => {
    try {
      const data = await ticketService.updateTicket(id, updates);
      return {
        success: true,
        data,
        message: "Ticket updated successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as Ticket,
        message: error?.message || "Failed to update ticket",
      };
    }
  };

  const deleteTicket = async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      await ticketService.deleteTicket(id);
      return {
        success: true,
        data: true,
        message: "Ticket deleted successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        data: false,
        message: error?.message || "Failed to delete ticket",
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
    try {
      const data = await ticketService.assignTicket(
        ticketId,
        employeeName,
        priority
      );
      return {
        success: true,
        data,
        message: "Ticket assigned successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as Ticket,
        message: error?.message || "Failed to assign ticket",
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
    try {
      const data = await ticketService.resolveTicket(ticketId, resolution);
      return {
        success: true,
        data,
        message: "Ticket resolved successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as Ticket,
        message: error?.message || "Failed to resolve ticket",
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
