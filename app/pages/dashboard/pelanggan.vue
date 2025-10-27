<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Tiket Pelanggan</h1>
      <p class="text-gray-600">Daftar tiket dari pelanggan e-commerce</p>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white rounded-xl p-6 border border-gray-200 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Status</label
          >
          <select
            v-model="filters.status"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Semua Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Prioritas</label
          >
          <select
            v-model="filters.priority"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Semua Prioritas</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Kategori</label
          >
          <select
            v-model="filters.category"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Semua Kategori</option>
            <option value="Akun & Keamanan">Akun & Keamanan</option>
            <option value="Pembayaran">Pembayaran</option>
            <option value="Pengiriman">Pengiriman</option>
            <option value="Pengembalian">Pengembalian</option>
          </select>
        </div>

        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Reset Filter
          </button>
        </div>
      </div>
    </div>

    <!-- Tickets Table -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase"
              >
                ID Tiket
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase"
              >
                Judul
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase"
              >
                Kategori
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase"
              >
                Status
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase"
              >
                Prioritas
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase"
              >
                Tanggal
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="ticket in filteredTickets"
              :key="ticket.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 text-sm font-medium text-gray-800">
                {{ ticket.id }}
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-800">
                  {{ ticket.title }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ ticket.description }}
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ ticket.category }}
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="getStatusBadgeClass(ticket.status)"
                >
                  {{ getStatusLabel(ticket.status) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="getPriorityBadgeClass(ticket.priority)"
                >
                  {{ getPriorityLabel(ticket.priority) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ formatDate(ticket.createdAt) }}
              </td>
              <td class="px-6 py-4">
                <button
                  class="text-green-600 hover:text-green-700 font-medium text-sm"
                  @click="viewTicket(ticket.id)"
                >
                  Detail
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredTickets.length === 0" class="p-12 text-center">
        <div class="text-gray-400 mb-4">
          <Inbox class="w-16 h-16 mx-auto" />
        </div>
        <h3 class="text-lg font-medium text-gray-800 mb-2">Tidak ada tiket</h3>
        <p class="text-gray-600">Tidak ada tiket yang sesuai dengan filter</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Inbox } from "lucide-vue-next";
import type { Ticket } from "~/types/ticket";

definePageMeta({
  layout: "dashboard",
});

const filters = ref({
  status: "",
  priority: "",
  category: "",
});

const pelangganTickets: Ticket[] = [
  {
    id: "TKT-001",
    title: "Tidak bisa login ke akun",
    description: "Saya lupa password dan tidak bisa reset",
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
    description: "Sudah 5 hari pesanan belum sampai",
    status: "in-progress",
    priority: "medium",
    role: "pelanggan",
    createdAt: "2025-01-15T09:15:00",
    updatedAt: "2025-01-15T11:20:00",
    category: "Pengiriman",
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
    id: "TKT-006",
    title: "Voucher tidak bisa digunakan",
    description: "Kode voucher error saat checkout",
    status: "resolved",
    priority: "low",
    role: "pelanggan",
    createdAt: "2025-01-14T16:30:00",
    updatedAt: "2025-01-15T09:00:00",
    category: "Pembayaran",
  },
  {
    id: "TKT-008",
    title: "Produk tidak sesuai deskripsi",
    description: "Barang yang diterima berbeda dengan foto",
    status: "in-progress",
    priority: "high",
    role: "pelanggan",
    createdAt: "2025-01-14T13:20:00",
    updatedAt: "2025-01-15T08:45:00",
    category: "Pengembalian",
  },
  {
    id: "TKT-010",
    title: "Cara membatalkan pesanan",
    description: "Ingin membatalkan pesanan tapi tidak tahu caranya",
    status: "open",
    priority: "low",
    role: "pelanggan",
    createdAt: "2025-01-15T07:15:00",
    updatedAt: "2025-01-15T07:15:00",
    category: "Pengiriman",
  },
  {
    id: "TKT-012",
    title: "Barang rusak saat diterima",
    description: "Produk pecah/rusak saat sampai",
    status: "open",
    priority: "urgent",
    role: "pelanggan",
    createdAt: "2025-01-15T12:00:00",
    updatedAt: "2025-01-15T12:00:00",
    category: "Pengembalian",
  },
];

const filteredTickets = computed(() => {
  return pelangganTickets.filter((ticket) => {
    if (filters.value.status && ticket.status !== filters.value.status)
      return false;
    if (filters.value.priority && ticket.priority !== filters.value.priority)
      return false;
    if (filters.value.category && ticket.category !== filters.value.category)
      return false;
    return true;
  });
});

const resetFilters = () => {
  filters.value = {
    status: "",
    priority: "",
    category: "",
  };
};

const viewTicket = (id: string) => {
  console.log("View ticket:", id);
  // TODO: Navigate to ticket detail page
};

const getStatusBadgeClass = (status: string) => {
  const classes = {
    open: "bg-blue-100 text-blue-700",
    "in-progress": "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-700",
  };
  return classes[status as keyof typeof classes] || "bg-gray-100 text-gray-700";
};

const getPriorityBadgeClass = (priority: string) => {
  const classes = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };
  return (
    classes[priority as keyof typeof classes] || "bg-gray-100 text-gray-700"
  );
};

const getStatusLabel = (status: string) => {
  const labels = {
    open: "Open",
    "in-progress": "In Progress",
    resolved: "Resolved",
    closed: "Closed",
  };
  return labels[status as keyof typeof labels] || status;
};

const getPriorityLabel = (priority: string) => {
  const labels = {
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
  };
  return labels[priority as keyof typeof labels] || priority;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
