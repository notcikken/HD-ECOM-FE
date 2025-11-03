<script setup lang="ts">
import { Ticket, TrendingUp, Clock, CheckCircle } from "lucide-vue-next";
import type { Ticket as TicketType } from "~/types/ticket.ts";
import TicketTable from "~/components/dashboard/TicketTable.vue";

definePageMeta({
  layout: "dashboard",
});

const statistics = [
  {
    label: "Total Tiket",
    value: "156",
    change: "+12%",
    icon: Ticket,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    badgeClass: "bg-green-100 text-green-700",
  },
  {
    label: "Tiket Aktif",
    value: "89",
    change: "+8%",
    icon: TrendingUp,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  {
    label: "Pending",
    value: "34",
    change: "-5%",
    icon: Clock,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    badgeClass: "bg-yellow-100 text-yellow-700",
  },
  {
    label: "Resolved",
    value: "67",
    change: "+15%",
    icon: CheckCircle,
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
];

const statusDistribution = [
  { label: "Open", value: 45, percentage: 29, color: "bg-blue-500" },
  { label: "In Progress", value: 44, percentage: 28, color: "bg-yellow-500" },
  { label: "Resolved", value: 67, percentage: 43, color: "bg-green-500" },
];

const priorityDistribution = [
  {
    label: "Urgent",
    value: 12,
    percentage: 8,
    color: "bg-red-500",
    dotColor: "bg-red-500",
  },
  {
    label: "High",
    value: 34,
    percentage: 22,
    color: "bg-orange-500",
    dotColor: "bg-orange-500",
  },
  {
    label: "Medium",
    value: 67,
    percentage: 43,
    color: "bg-yellow-500",
    dotColor: "bg-yellow-500",
  },
  {
    label: "Low",
    value: 43,
    percentage: 27,
    color: "bg-green-500",
    dotColor: "bg-green-500",
  },
];

const recentTickets: TicketType[] = [
  {
    id: "TKT-001",
    title: "Tidak bisa logi ke akun",
    description: "User mengalami kesulitan login",
    status: "open",
    priority: "high",
    role: "pelanggan",
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
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p class="text-gray-600">Statistik dan ringkasan tiket support</p>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div
        v-for="stat in statistics"
        :key="stat.label"
        class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-center justify-between mb-4">
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center"
            :class="stat.bgColor"
          >
            <component
              :is="stat.icon"
              class="w-6 h-6"
              :class="stat.iconColor"
            />
          </div>
          <span
            class="text-xs font-semibold px-2 py-1 rounded-full"
            :class="stat.badgeClass"
          >
            {{ stat.change }}
          </span>
        </div>
        <h3 class="text-2xl font-bold text-gray-800 mb-1">{{ stat.value }}</h3>
        <p class="text-sm text-gray-600">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Status Distribution -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">Status Tiket</h3>
        <div class="space-y-4">
          <div v-for="status in statusDistribution" :key="status.label">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">{{
                status.label
              }}</span>
              <span class="text-sm font-semibold text-gray-800">{{
                status.value
              }}</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="status.color"
                :style="{ width: status.percentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Priority Distribution -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">
          Prioritas Tiket
        </h3>
        <div class="space-y-4">
          <div v-for="priority in priorityDistribution" :key="priority.label">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div
                  class="w-3 h-3 rounded-full"
                  :class="priority.dotColor"
                ></div>
                <span class="text-sm font-medium text-gray-700">{{
                  priority.label
                }}</span>
              </div>
              <span class="text-sm font-semibold text-gray-800">{{
                priority.value
              }}</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="priority.color"
                :style="{ width: priority.percentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Tickets -->
    <div class="bg-white rounded-xl border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">Tiket Terbaru</h3>
          <button
            class="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Lihat Semua
          </button>
        </div>
      </div>

      <TicketTable
        :tickets="recentTickets"
        :show-role="true"
        @view-ticket="viewTicket"
      />
    </div>
  </div>
</template>
