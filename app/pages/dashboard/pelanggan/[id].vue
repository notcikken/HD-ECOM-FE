<!-- eslint-disable @typescript-eslint/no-explicit-any -->

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  ArrowLeft,
  User,
  AlertCircle,
  CheckCircle,
  Bell,
  MessageSquare,
} from "lucide-vue-next";
import ActionModal from "~/components/actionModal.vue";
import type { Ticket } from "~/types/ticket";
import DetailedInfoCard from "~/components/dashboard/DetailedInfoCard.vue";
import TicketHeaderCard from "~/components/dashboard/TicketHeaderCard.vue";
import TicketStepper from "~/components/dashboard/TicketStepper.vue";
import QuickActionsCard from "~/components/dashboard/QuickActionsCard.vue";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const router = useRouter();
const { fetchTicketById, assignTicket, resolveTicket } = useTicketApi();

const ticketId = computed(() => route.params.id as string);
const loading = ref(false);
const updating = ref(false);
const error = ref<string | null>(null);
const ticket = ref<Ticket | null>(null);

// Toast notification
const toast = ref<{
  show: boolean;
  message: string;
  type: "success" | "error";
}>({
  show: false,
  message: "",
  type: "success",
});

// Modal states
const showAssignModal = ref(false);
const showResolveModal = ref(false);

// Form data
const assigneeForm = ref({
  assignedTo: "",
  priority: "medium" as "low" | "medium" | "high" | "urgent",
});

const resolveForm = ref({
  resolution: "",
});

const showToast = (message: string, type: "success" | "error" = "success") => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

const loadTicketDetail = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetchTicketById(ticketId.value);

    if (response.success && response.data) {
      ticket.value = response.data;
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

const handleAssignTicket = async () => {
  if (!assigneeForm.value.assignedTo.trim()) {
    showToast("Silakan masukkan nama pegawai", "error");
    return;
  }

  updating.value = true;

  try {
    const response = await assignTicket(
      ticketId.value,
      assigneeForm.value.assignedTo,
      assigneeForm.value.priority
    );

    if (response.success) {
      ticket.value = response.data;
      showAssignModal.value = false;
      assigneeForm.value = {
        assignedTo: "",
        priority: "medium",
      };
      showToast(
        "Tiket berhasil ditugaskan dengan prioritas " +
          assigneeForm.value.priority.toUpperCase()
      );
    } else {
      showToast(response.message || "Failed to assign ticket", "error");
    }
  } catch (err) {
    showToast("An error occurred while assigning ticket", "error");
    console.error(err);
  } finally {
    updating.value = false;
  }
};

const handleResolveTicket = async () => {
  if (!resolveForm.value.resolution.trim()) {
    showToast("Silakan masukkan resolusi masalah", "error");
    return;
  }

  updating.value = true;

  try {
    const response = await resolveTicket(
      ticketId.value,
      resolveForm.value.resolution
    );

    if (response.success) {
      ticket.value = response.data;
      showResolveModal.value = false;
      resolveForm.value.resolution = "";
      showToast("Tiket berhasil di-resolve dengan solusi yang diberikan");
    } else {
      showToast(response.message || "Failed to resolve ticket", "error");
    }
  } catch (err) {
    showToast("An error occurred while resolving ticket", "error");
    console.error(err);
  } finally {
    updating.value = false;
  }
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  loadTicketDetail();
});
</script>

<template>
  <div>
    <!-- Toast Notification -->
    <ToastNotification
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
    />

    <!-- Back Button -->
    <button
      class="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors group"
      @click="goBack"
    >
      <ArrowLeft
        class="w-5 h-5 group-hover:-translate-x-1 transition-transform"
      />
      <span class="font-medium">Kembali</span>
    </button>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-24">
      <div class="relative">
        <div
          class="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500"
        ></div>
        <div
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <Bell class="w-8 h-8 text-green-500 animate-pulse" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-linear-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-8 text-center shadow-lg"
    >
      <div
        class="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center"
      >
        <AlertCircle class="w-8 h-8 text-white" />
      </div>
      <h3 class="text-xl font-bold text-red-800 mb-2">
        Oops! Terjadi Kesalahan
      </h3>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button
        class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all hover:shadow-lg font-medium"
        @click="loadTicketDetail"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Ticket Detail -->
    <div v-else-if="ticket" class="space-y-6">
      <!-- Header Card -->
      <TicketHeaderCard :ticket="ticket" />
      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column - Info Card -->
        <DetailedInfoCard :ticket="ticket" />

        <!-- Middle Column - Status Stepper -->
        <TicketStepper :ticket="ticket" />

        <!-- Right Column - Quick Actions -->
        <div class="space-y-6">
          <!-- Quick Actions Card -->
          <QuickActionsCard
            :ticket="ticket"
            :updating="updating"
            @assign="showAssignModal = true"
            @resolve="showResolveModal = true"
          />
        </div>
      </div>
    </div>

    <!-- Assign & Set Priority Modal -->
    <ActionModal
      :show="showAssignModal"
      title="Tugaskan & Set Prioritas"
      :icon="User"
      icon-bg-class="bg-blue-500"
      @close="showAssignModal = false"
    >
      <p class="text-sm text-gray-600 mb-4">
        Masukkan nama pegawai yang akan menangani tiket ini dan tentukan
        prioritas kasusnya. Status akan otomatis berubah menjadi "In Progress".
      </p>

      <!-- Assignee Input -->
      <div class="mb-4">
        <label
          class="block text-sm font-medium text-gray-700 mb-2"
          for="assignee"
        >
          Nama Pegawai <span class="text-red-500">*</span>
        </label>
        <input
          id="assignee"
          v-model="assigneeForm.assignedTo"
          type="text"
          placeholder="Contoh: John Doe"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>

      <!-- Priority Select -->
      <div class="mb-4">
        <label
          class="block text-sm font-medium text-gray-700 mb-2"
          for="priority"
        >
          Prioritas <span class="text-red-500">*</span>
        </label>
        <select
          id="priority"
          v-model="assigneeForm.priority"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        >
          <option value="low">Low - Tidak Mendesak</option>
          <option value="medium">Medium - Normal</option>
          <option value="high">High - Mendesak</option>
          <option value="urgent">Urgent - Sangat Mendesak</option>
        </select>
      </div>

      <!-- Info Box -->
      <div
        class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800"
      >
        <div class="flex items-start gap-2">
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Prioritas akan membantu tim untuk mengatur urutan penanganan tiket
          </span>
        </div>
      </div>

      <template #actions>
        <button
          class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          :disabled="updating"
          @click="showAssignModal = false"
        >
          Batal
        </button>
        <button
          class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:opacity-50 shadow-md"
          :disabled="updating || !assigneeForm.assignedTo.trim()"
          @click="handleAssignTicket"
        >
          {{ updating ? "Memproses..." : "Tugaskan" }}
        </button>
      </template>
    </ActionModal>

    <!-- Resolve Ticket Modal -->
    <ActionModal
      :show="showResolveModal"
      title="Resolve Tiket"
      :icon="CheckCircle"
      icon-bg-class="bg-green-500"
      @close="showResolveModal = false"
    >
      <p class="text-sm text-gray-600 mb-4">
        Masalah customer telah diselesaikan. Jelaskan solusi yang diberikan agar
        customer dapat memahami penyelesaian masalahnya.
      </p>

      <!-- Resolution Input -->
      <div class="mb-4">
        <label
          class="block text-sm font-medium text-gray-700 mb-2"
          for="resolution"
        >
          Solusi/Resolusi <span class="text-red-500">*</span>
        </label>
        <textarea
          id="resolution"
          v-model="resolveForm.resolution"
          rows="5"
          placeholder="Jelaskan solusi yang telah diberikan untuk menyelesaikan masalah customer..."
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
        ></textarea>
      </div>

      <!-- Info Box -->
      <div
        class="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800"
      >
        <div class="flex items-start gap-2">
          <MessageSquare class="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Customer akan dapat melihat solusi ini di halaman tiket mereka
          </span>
        </div>
      </div>

      <template #actions>
        <button
          class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          :disabled="updating"
          @click="showResolveModal = false"
        >
          Batal
        </button>
        <button
          class="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all font-medium disabled:opacity-50 shadow-md"
          :disabled="updating || !resolveForm.resolution.trim()"
          @click="handleResolveTicket"
        >
          {{ updating ? "Memproses..." : "Resolve Tiket" }}
        </button>
      </template>
    </ActionModal>
  </div>
</template>
