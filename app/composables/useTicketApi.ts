/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Ticket, TicketPriority } from "~/types/ticket";
import { ticketService } from "~/services/ticketService";

interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  role?: "customer" | "seller";
  cursor?: string;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    limit?: number;
    next_cursor?: string | null;
  };
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

export const useTicketApi = () => {
  const fetchTickets = async (
    filters?: TicketFilters
  ): Promise<ApiResponse<Ticket[]>> => {
    try {
      const config = useRuntimeConfig();
      const { token } = useAuth();
      const query = new URLSearchParams();

      if (filters?.role) query.set("role", filters.role);
      if (filters?.status) query.set("status", filters.status);
      if (filters?.priority) query.set("priority", filters.priority);
      if (filters?.category) query.set("category", filters.category);
      if (filters?.cursor) query.set("cursor", filters.cursor);
      if (filters?.limit) query.set("limit", filters.limit.toString());

      const queryString = query.toString();
      const url = `${config.public.apiBase}/api/tickets${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await $fetch<{ 
        data: { data: Ticket[]; meta?: { limit?: number; next_cursor?: string | null } } 
      } | Ticket[]>(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });

      // Handle API response with metadata
      if (response && typeof response === 'object' && 'data' in response) {
        const apiData = response.data;
        return {
          success: true,
          data: apiData.data || [],
          meta: apiData.meta,
        };
      }

      // Fallback for array response
      return {
        success: true,
        data: Array.isArray(response) ? response : [],
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

  const fetchTicketCategories = async (): Promise<ApiResponse<TicketCategory[]>> => {
    try {
      const data = await ticketService.fetchTicketCategories();
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error?.message || "Failed to fetch ticket categories",
      };
    }
  };

  /**
   * Fetch current user's tickets
   */
  const fetchMyTickets = async (): Promise<ApiResponse<Ticket[]>> => {
    try {
      const data = await ticketService.fetchMyTickets();
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error?.message || "Failed to fetch your tickets",
      };
    }
  };

  const createTicket = async (
    ticket: any // Changed to any to accommodate the new payload structure
  ): Promise<ApiResponse<Ticket>> => {
    try {
      const config = useRuntimeConfig();
      const { token } = useAuth();

      const response = await $fetch<{ data: Ticket } | Ticket>(
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

      const data = "data" in response ? response.data : response;

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

  /**
   * Fetch ticket attachments
   */
  const fetchTicketAttachments = async (
    ticketId: number
  ): Promise<ApiResponse<TicketAttachment[]>> => {
    try {
      const data = await ticketService.fetchTicketAttachments(ticketId);
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error?.message || "Failed to fetch ticket attachments",
      };
    }
  };

  /**
   * Assign ticket to support user via ticket-assignments endpoint
   */
  const assignTicketToSupport = async (
    ticketId: number,
    adminId: number
  ): Promise<ApiResponse<any>> => {
    try {
      const config = useRuntimeConfig();
      const { token } = useAuth();

      const payload = {
        id_admin: adminId,
        id_ticket: ticketId,
        tanggal_ditugaskan: new Date().toISOString(),
      };

      const response = await $fetch<{ data: any } | any>(
        `${config.public.apiBase}/api/ticket-assignments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.value}`,
            "Content-Type": "application/json",
          },
          body: payload,
        }
      );

      const data = "data" in response ? response.data : response;

      return {
        success: true,
        data,
        message: "Ticket assigned successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error?.message || "Failed to assign ticket",
      };
    }
  };

  return {
    fetchTickets,
    fetchTicketById,
    fetchTicketStats,
    fetchTicketCategories,
    fetchMyTickets,
    fetchTicketAttachments,
    createTicket,
    updateTicket,
    deleteTicket,
    assignTicket,
    assignTicketToSupport,
    resolveTicket,
  };
};
