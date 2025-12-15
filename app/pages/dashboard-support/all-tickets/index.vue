<script setup lang="ts">
import { Ticket as ChevronDown } from "lucide-vue-next";
import type { Ticket as TicketType, TicketRole, TicketAssignment } from "~/types/ticket.ts";
import TicketTable from "~/components/dashboard-employee/TicketTableEmployee.vue";
import { CATEGORY_MAP } from "~/utils/convertTicket";

definePageMeta({
  layout: "employee",
});

const tickets = ref<TicketType[]>([]);
const visibleTickets = ref<TicketType[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const hasMore = ref(false);
const pageSize = 10;

const updateVisibleTickets = () => {
  const nextLength = Math.min(
    tickets.value.length,
    visibleTickets.value.length + pageSize
  );
  visibleTickets.value = tickets.value.slice(0, nextLength);
  hasMore.value = tickets.value.length > visibleTickets.value.length;
};

const mapAssignmentToTicket = (assignment: TicketAssignment): TicketType => {
  const { ticket } = assignment;

  const categoryEntry = Object.entries(CATEGORY_MAP).find(
    ([, name]) => name === ticket.category_name
  );
  const id_category = categoryEntry ? Number(categoryEntry[0]) : 0;

  const role: TicketRole =
    ticket.tipe_pengaduan === "seller" ? "penjual" : "pelanggan";

  return {
    id_ticket: ticket.id_ticket.toString(),
    kode_tiket: ticket.kode_ticket,
    judul: ticket.judul,
    deskripsi: ticket.deskripsi,
    id_status: 0,
    status: ticket.status_name,
    username: ticket.username,
    id_priority: 0,
    priority: null,
    role,
    tipe_pengaduan: ticket.tipe_pengaduan,
    createdBy: ticket.username,
    tanggal_dibuat: assignment.tanggal_ditugaskan,
    updatedAt: assignment.tanggal_ditugaskan,
    assignedTo: undefined,
    id_category,
    category: ticket.category_name,
    resolvedAt: undefined,
    resolution: undefined,
    supportingDocuments: [],
  };
};

const fetchAllAssignedTickets = async () => {
  try {
    loading.value = true;
    const config = useRuntimeConfig();
    const { token } = useAuth();

    const response = await $fetch<{
      status: number;
      message: string;
      data: { data: TicketAssignment[] };
    }>(`${config.public.apiBase}/api/ticket-assignments/my-assignments`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    const assignments = response.data.data || [];
    tickets.value = assignments.map(mapAssignmentToTicket);
    // Inisialisasi tiket yang ditampilkan pertama kali
    visibleTickets.value = [];
    updateVisibleTickets();
  } catch (error) {
    console.error("Failed to fetch all assigned tickets:", error);
    tickets.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAllAssignedTickets);

const loadNextPage = () => {
  if (loading.value || loadingMore.value || !hasMore.value) return;
  loadingMore.value = true;
  try {
    updateVisibleTickets();
  } finally {
    loadingMore.value = false;
  }
};

const viewTicket = (id: string) => {
  console.log("View ticket:", id);
  // TODO: Navigate to ticket detail page
};
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">All Tickets</h1>
      <p class="text-gray-600">
        Semua tiket yang pernah ditugaskan kepada anda
      </p>
    </div>

    <div class="bg-white rounded-xl border border-gray-200">
      <TicketTable
        :tickets="visibleTickets"
        :loading="loading"
        :show-role="true"
        base-route="dashboard-support/all-tickets"
        @view-ticket="viewTicket"
      />
    </div>

    <!-- Loading More Indicator -->
    <div v-if="loadingMore" class="mt-4">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="animate-pulse space-y-4">
          <div class="h-12 bg-gray-200 rounded"></div>
          <div class="h-12 bg-gray-200 rounded"></div>
          <div class="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div
      v-if="hasMore && visibleTickets.length > 0"
      class="mt-6 flex justify-center"
    >
      <button
        @click="loadNextPage"
        :disabled="loading || loadingMore"
        class="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{{ loadingMore ? "Memuat..." : "Muat Lebih Banyak" }}</span>
        <ChevronDown v-if="!loadingMore" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>