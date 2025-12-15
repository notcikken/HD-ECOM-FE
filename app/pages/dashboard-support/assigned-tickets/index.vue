<script setup lang="ts">
import type { Ticket as TicketType, TicketRole, TicketAssignment } from "~/types/ticket.ts";
import TicketTable from "~/components/dashboard-employee/TicketTableEmployee.vue";
import { CATEGORY_MAP } from "~/utils/convertTicket";

definePageMeta({
  layout: "employee",
});

const tickets = ref<TicketType[]>([]);
const loading = ref(false);

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

const fetchAssignedTickets = async () => {
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

    // Hanya ambil tiket dengan status "In Progress"
    const activeAssignments = assignments.filter(
      (a) => a.ticket.status_name === "In Progress"
    );
    tickets.value = activeAssignments.map(mapAssignmentToTicket);
  } catch (error) {
    console.error("Failed to fetch assigned tickets:", error);
    tickets.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAssignedTickets);

const viewTicket = (id: string) => {
  console.log("View ticket:", id);
  // TODO: Navigate to ticket detail page
};
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Assigned Tickets</h1>
      <p class="text-gray-600">Tiket yang ditugaskan kepada anda</p>
    </div>

    <div class="bg-white rounded-xl border border-gray-200">
      <TicketTable
        :tickets="tickets"
        :loading="loading"
        :show-role="true"
        base-route="dashboard-support/assigned-tickets"
        @view-ticket="viewTicket"
      />
    </div>
  </div>
</template>