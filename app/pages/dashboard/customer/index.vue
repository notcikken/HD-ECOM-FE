<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Ticket } from "~/types/ticket";
import { useTicketApi } from "~/composables/useTicketApi";
import TicketFilter from "~/components/dashboard/TicketFilter.vue";
import TicketTable from "~/components/dashboard/TicketTable.vue";
import { ChevronDown } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
});

const { fetchTickets } = useTicketApi();

const loading = ref(false);
const loadingMore = ref(false);
const error = ref<string | null>(null);
const tickets = ref<Ticket[]>([]);
const nextCursor = ref<string | null>(null);
const hasMore = ref(true);
const loadMoreButtonRef = ref<HTMLElement | null>(null);

const filters = ref({
  status: "",
  priority: "",
  category: "",
});

const loadTickets = async (cursor?: string, append = false) => {
  if (append) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }
  error.value = null;

  try {
    const params: Record<string, any> = {
      role: "customer",
      status: filters.value.status !== "" ? Number(filters.value.status) : undefined,
      priority: filters.value.priority || undefined,
      category: filters.value.category || undefined,
    };

    // Add cursor parameter if provided
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await fetchTickets(params);

    const newTickets = Array.isArray(response.data) ? response.data : [];
    
    // Append or replace tickets based on whether we're loading more
    if (append) {
      tickets.value = [...tickets.value, ...newTickets];
    } else {
      tickets.value = newTickets;
    }
    
    // Extract next_cursor from response metadata
    if (response.meta) {
      nextCursor.value = response.meta.next_cursor || null;
      hasMore.value = !!response.meta.next_cursor;
    } else {
      nextCursor.value = null;
      hasMore.value = false;
    }
  } catch (err) {
    error.value = "An error occurred while loading tickets";
    console.error(err);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadNextPage = () => {
  if (nextCursor.value && !loading.value && !loadingMore.value) {
    loadTickets(nextCursor.value, true);
  }
};

const resetFilters = () => {
  filters.value = {
    status: "",
    priority: "",
    category: "",
  };
  nextCursor.value = null;
  hasMore.value = true;
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
      v-if="hasMore && tickets.length > 0" 
      class="mt-6 flex justify-center"
      ref="loadMoreButtonRef"
    >
      <button
        @click="loadNextPage"
        :disabled="loading || loadingMore"
        class="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{{ loadingMore ? 'Memuat...' : 'Muat Lebih Banyak' }}</span>
        <ChevronDown v-if="!loadingMore" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
