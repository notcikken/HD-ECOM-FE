<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  ArrowLeft,
  Clock,
  User,
  Tag,
  Calendar,
  AlertCircle,
} from "lucide-vue-next";
import type { Ticket, TicketStatus } from "~/types/ticket";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const router = useRouter();
const { fetchTicketById, updateTicket } = useTicketApi();

const ticketId = computed(() => route.params.id as string);

const loading = ref(false);
const updating = ref(false);
const error = ref<string | null>(null);
const ticket = ref<Ticket | null>(null);
const selectedStatus = ref<TicketStatus>("open");

const statusOptions: { value: TicketStatus; label: string; color: string }[] = [
  { value: "open", label: "Open", color: "bg-blue-100 text-blue-700" },
  {
    value: "in-progress",
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    value: "resolved",
    label: "Resolved",
    color: "bg-green-100 text-green-700",
  },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-700" },
];

const loadTicketDetail = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetchTicketById(ticketId.value);

    if (response.success && response.data) {
      ticket.value = response.data;
      selectedStatus.value = response.data.status;
    } else {
      error.value = response.message || "Ticket not found";
    }
  } catch (err) {
    error.value = "An error occurred while loading ticket";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleStatusChange = async (newStatus: TicketStatus) => {
  if (!ticket.value || newStatus === ticket.value.status) return;

  updating.value = true;
  error.value = null;

  try {
    const response = await updateTicket(ticketId.value, {
      status: newStatus,
    });

    if (response.success) {
      ticket.value = response.data;
      selectedStatus.value = newStatus;
      // Show success notification (you can add a toast/notification system)
      console.log("Status updated successfully");
    } else {
      error.value = response.message || "Failed to update status";
      // Revert the select value
      selectedStatus.value = ticket.value.status;
    }
  } catch (err) {
    error.value = "An error occurred while updating status";
    console.error(err);
    // Revert the select value
    if (ticket.value) {
      selectedStatus.value = ticket.value.status;
    }
  } finally {
    updating.value = false;
  }
};

const goBack = () => {
  router.back();
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

const getRoleBadgeClass = (role: string) => {
  return role === "pelanggan"
    ? "bg-purple-100 text-purple-700"
    : "bg-indigo-100 text-indigo-700";
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

onMounted(() => {
  loadTicketDetail();
});
</script>

<template>
  <div>
    <!-- Back Button -->
    <button
      @click="goBack"
      class="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
    >
      <ArrowLeft class="w-5 h-5" />
      <span class="font-medium">Kembali</span>
    </button>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-24">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"
      ></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-xl p-8 text-center"
    >
      <AlertCircle class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-red-800 mb-2">Error</h3>
      <p class="text-red-600">{{ error }}</p>
      <button
        @click="loadTicketDetail"
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Ticket Detail -->
    <div v-else-if="ticket" class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-sm font-semibold text-gray-500">
                {{ ticket.id }}
              </span>
              <span
                class="px-2 py-1 rounded-full text-xs font-medium capitalize"
                :class="getRoleBadgeClass(ticket.role)"
              >
                {{ ticket.role }}
              </span>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">
              {{ ticket.title }}
            </h1>
            <p class="text-gray-600">{{ ticket.description }}</p>
          </div>
        </div>

        <!-- Status Change Dropdown -->
        <div class="border-t border-gray-200 pt-4 mt-4">
          <div class="flex items-center gap-4">
            <label class="text-sm font-medium text-gray-700">
              Status Tiket:
            </label>
            <div class="relative">
              <select
                v-model="selectedStatus"
                @change="handleStatusChange(selectedStatus)"
                :disabled="updating"
                class="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                :class="getStatusBadgeClass(selectedStatus)"
              >
                <option
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <div
                class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <span
              v-if="updating"
              class="text-sm text-gray-500 flex items-center gap-2"
            >
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"
              ></div>
              Memperbarui...
            </span>
          </div>
        </div>
      </div>

      <!-- Ticket Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Left Column -->
        <div class="space-y-6">
          <!-- Priority & Category -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">
              Informasi Tiket
            </h2>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center"
                >
                  <AlertCircle class="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Prioritas</p>
                  <span
                    class="px-3 py-1 rounded-full text-xs font-semibold"
                    :class="getPriorityBadgeClass(ticket.priority)"
                  >
                    {{ getPriorityLabel(ticket.priority) }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"
                >
                  <Tag class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Kategori</p>
                  <p class="text-sm font-medium text-gray-800">
                    {{ ticket.category }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"
                >
                  <User class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Role</p>
                  <span
                    class="px-3 py-1 rounded-full text-xs font-medium capitalize"
                    :class="getRoleBadgeClass(ticket.role)"
                  >
                    {{ ticket.role }}
                  </span>
                </div>
              </div>

              <div v-if="ticket.assignedTo" class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"
                >
                  <User class="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Ditugaskan ke</p>
                  <p class="text-sm font-medium text-gray-800">
                    {{ ticket.assignedTo }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Timeline -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Timeline</h2>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0"
                >
                  <Calendar class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Dibuat</p>
                  <p class="text-sm font-medium text-gray-800">
                    {{ formatDate(ticket.createdAt) }}
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"
                >
                  <Clock class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Terakhir Diperbarui</p>
                  <p class="text-sm font-medium text-gray-800">
                    {{ formatDate(ticket.updatedAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Aksi</h2>
            <div class="space-y-3">
              <button
                class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Kirim Balasan
              </button>
              <button
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Tugaskan ke Admin
              </button>
              <button
                class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cetak Tiket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
