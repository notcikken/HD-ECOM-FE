<script setup lang="ts">
import { Inbox } from "lucide-vue-next";
import type { Ticket } from "~/types/ticket";

interface Props {
  tickets: Ticket[];
  loading?: boolean;
  showRole?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showRole: false,
});

const router = useRouter();

const getStatusBadgeClass = (status: string) => {
  const classes = {
    open: "bg-blue-100 text-blue-700",
    "in-progress": "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-700",
  };
  return classes[status as keyof typeof classes] || "bg-gray-100 text-gray-700";
};

const getRoleBadgeClass = (role: string) => {
  return role === "pelanggan"
    ? "bg-purple-100 text-purple-700"
    : "bg-indigo-100 text-indigo-700";
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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleViewTicket = (ticket: Ticket) => {
  // Navigate based on role
  const route = `/dashboard/${ticket.role}/${ticket.id}`;
  router.push(route);
};
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"
      ></div>
    </div>

    <!-- Table Content -->
    <template v-else>
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
                v-if="showRole"
                class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase"
              >
                Role
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
              v-for="ticket in tickets"
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
              </td>
              <td v-if="showRole" class="px-6 py-4 text-sm">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium capitalize"
                  :class="getRoleBadgeClass(ticket.role)"
                >
                  {{ ticket.role }}
                </span>
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
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ formatDate(ticket.createdAt) }}
              </td>
              <td class="px-6 py-4">
                <button
                  class="text-green-600 hover:text-green-700 font-medium text-sm cursor-pointer"
                  @click="handleViewTicket(ticket)"
                >
                  Detail
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="tickets.length === 0" class="p-12 text-center">
        <div class="text-gray-400 mb-4">
          <Inbox class="w-16 h-16 mx-auto" />
        </div>
        <h3 class="text-lg font-medium text-gray-800 mb-2">Tidak ada tiket</h3>
        <p class="text-gray-600">Tidak ada tiket yang sesuai dengan filter</p>
      </div>
    </template>
  </div>
</template>
