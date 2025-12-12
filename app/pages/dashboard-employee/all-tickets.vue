<script setup lang="ts">
import { Ticket, TrendingUp, CheckCircle } from "lucide-vue-next";
import type { Ticket as TicketType } from "~/types/ticket.ts";
import TicketTable from "~/components/dashboard-employee/TicketTableEmployee.vue";

definePageMeta({
  layout: "employee",
});


const recentTickets: TicketType[] = [
  {
    id: "TKT-001",
    title: "Tidak bisa logi ke akun",
    description: "User mengalami kesulitan login",
    status: "open",
    priority: "high",
    role: "pelanggan",
    createdBy: "Budi Santoso",
    createdAt: "2025-01-15T10:30:00",
    updatedAt: "2025-01-15T10:30:00",
    category: "Akun & Keamanan",
  },
  {
    id: "TKT-002",
    title: "Pesanan belum diterima",
    description: "Pelanggan belum menerima pesanan",
    status: "in-progress",
    priority: "medium",
    role: "pelanggan",
    createdBy: "Siti Aminah",
    createdAt: "2025-01-15T09:15:00",
    updatedAt: "2025-01-15T11:20:00",
    category: "Pengiriman",
  },
  {
    id: "TKT-003",
    title: "Tidak bisa upload produk",
    description: "Error saat upload foto produk",
    status: "resolved",
    priority: "low",
    role: "penjual",
    createdBy: "Andi Wijaya",
    createdAt: "2025-01-14T14:45:00",
    updatedAt: "2025-01-15T08:30:00",
    category: "Teknis Aplikasi",
  },
  {
    id: "TKT-004",
    title: "Refund belum masuk",
    description: "Dana refund belum masuk ke rekening",
    status: "open",
    priority: "urgent",
    role: "pelanggan",
    createdBy: "Budi Santoso",
    createdAt: "2025-01-15T11:00:00",
    updatedAt: "2025-01-15T11:00:00",
    category: "Pembayaran",
  },
  {
    id: "TKT-005",
    title: "Dashboard penjual tidak loading",
    description: "Halaman dashboard error",
    status: "in-progress",
    priority: "high",
    role: "penjual",
    createdBy: "Rina Kurnia",
    createdAt: "2025-01-15T08:20:00",
    updatedAt: "2025-01-15T10:45:00",
    category: "Teknis Aplikasi",
  },
];

const viewTicket = (id: string) => {
  console.log("View ticket:", id);
  // TODO: Navigate to ticket detail page
};
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">All Tickets</h1>
      <p class="text-gray-600">Semua tiket yang pernah ditugaskan kepada anda</p>
    </div>

    <!-- Recent Tickets -->
    <div class="bg-white rounded-xl border border-gray-200">

      <TicketTable
        :tickets="recentTickets"
        :show-role="true"
        @view-ticket="viewTicket"
      />
    </div>
  </div>
</template>
