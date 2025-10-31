<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Ticket } from "~/types/ticket";
import { useTicketApi } from "~/composables/useTicketApi";
import TicketFilter from "~/components/dashboard/TicketFilter.vue";
import TicketTable from "~/components/dashboard/Table.vue";

definePageMeta({
  layout: "dashboard",
});

const { fetchTickets } = useTicketApi();

const loading = ref(false);
const error = ref<string | null>(null);
const tickets = ref<Ticket[]>([]);

const filters = ref({
  status: "",
  priority: "",
  category: "",
});

const loadTickets = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetchTickets({
      role: "pelanggan",
      status: filters.value.status || undefined,
      priority: filters.value.priority || undefined,
      category: filters.value.category || undefined,
    });

    if (response.success) {
      tickets.value = response.data;
    } else {
      error.value = response.message || "Failed to load tickets";
    }
  } catch (err) {
    error.value = "An error occurred while loading tickets";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    status: "",
    priority: "",
    category: "",
  };
  loadTickets();
};

const viewTicket = (id: string) => {
  console.log("View ticket:", id);
  // TODO: Navigate to ticket detail page
};

onMounted(() => {
  loadTickets();
});
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Tiket Pelanggan</h1>
      <p class="text-gray-600">Daftar tiket dari pelanggan e-commerce</p>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
    >
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Filter Bar -->
    <TicketFilter
      v-model="filters"
      @change="loadTickets"
      @reset="resetFilters"
    />

    <!-- Tickets Table -->
    <TicketTable
      :tickets="tickets"
      :loading="loading"
      @view-ticket="viewTicket"
    />
  </div>
</template>
