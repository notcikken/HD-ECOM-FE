<!-- eslint-disable @typescript-eslint/no-explicit-any -->

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  ArrowLeft,
  Clock,
  User,
  Tag,
  Calendar,
  AlertCircle,
  Mail,
  UserPlus,
  CheckCircle,
  XCircle,
  FileText,
  Bell,
  Plus,
} from "lucide-vue-next";
import type { Ticket } from "~/types/ticket";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const router = useRouter();
const { fetchTicketById, assignTicket, sendEmailReply } = useTicketApi();

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
const showEmailModal = ref(false);
const showNewTicketModal = ref(false);

// Form data
const assigneeEmail = ref("");
const shouldResolveAfterEmail = ref(false);

// Activity log (mock data - in real app, fetch from API)
const activityLog = ref([
  {
    id: 1,
    action: "Ticket Created",
    user: "System",
    timestamp: new Date().toISOString(),
    icon: FileText,
  },
]);

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
  if (!assigneeEmail.value.trim()) {
    showToast("Silakan masukkan email admin", "error");
    return;
  }

  updating.value = true;

  try {
    const response = await assignTicket(ticketId.value, assigneeEmail.value);

    if (response.success) {
      ticket.value = response.data;
      showAssignModal.value = false;
      assigneeEmail.value = "";
      showToast("Tiket berhasil ditugaskan dan status berubah ke In Progress");

      activityLog.value.unshift({
        id: Date.now(),
        action: `Assigned to ${assigneeEmail.value}`,
        user: "Admin",
        timestamp: new Date().toISOString(),
        icon: UserPlus,
      });
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

const handleSendEmail = async () => {
  updating.value = true;

  try {
    const response = await sendEmailReply(
      ticketId.value,
      shouldResolveAfterEmail.value
    );

    if (response.success) {
      ticket.value = response.data;
      showEmailModal.value = false;
      shouldResolveAfterEmail.value = false;

      if (response.data.status === "resolved") {
        showToast(
          "Email terkirim dan tiket di-resolve. Jika masih ada masalah, customer dapat membuat tiket baru."
        );
      } else {
        showToast("Email berhasil dikirim");
      }

      activityLog.value.unshift({
        id: Date.now(),
        action: "Email sent to customer",
        user: "Admin",
        timestamp: new Date().toISOString(),
        icon: Mail,
      });
    } else {
      showToast(response.message || "Failed to send email", "error");
    }
  } catch (err) {
    showToast("An error occurred while sending email", "error");
    console.error(err);
  } finally {
    updating.value = false;
  }
};

const handleCreateNewTicket = () => {
  router.push("/contact-support");
};

const goBack = () => {
  router.back();
};

const getStatusBadgeClass = (status: string) => {
  const classes = {
    open: "bg-blue-100 text-blue-700 border border-blue-200",
    "in-progress": "bg-yellow-100 text-yellow-700 border border-yellow-200",
    resolved: "bg-green-100 text-green-700 border border-green-200",
  };
  return classes[status as keyof typeof classes] || "bg-gray-100 text-gray-700";
};

const getPriorityBadgeClass = (priority: string) => {
  const classes = {
    low: "bg-green-100 text-green-700 border border-green-200",
    medium: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    high: "bg-orange-100 text-orange-700 border border-orange-200",
    urgent: "bg-red-100 text-red-700 border border-red-200",
  };
  return (
    classes[priority as keyof typeof classes] || "bg-gray-100 text-gray-700"
  );
};

const getRoleBadgeClass = (role: string) => {
  return role === "pelanggan"
    ? "bg-purple-100 text-purple-700 border border-purple-200"
    : "bg-indigo-100 text-indigo-700 border border-indigo-200";
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

const ticketSteps = computed(() => {
  if (!ticket.value) return [];

  const steps = [
    {
      id: 1,
      label: "Open",
      status: "open",
      icon: FileText,
      description: "Tiket dibuat dan menunggu penugasan",
      timestamp: ticket.value.createdAt,
      isCompleted: true,
      isCurrent: ticket.value.status === "open",
    },
    {
      id: 2,
      label: "In Progress",
      status: "in-progress",
      icon: UserPlus,
      description: ticket.value.assignedTo
        ? `Ditugaskan ke ${ticket.value.assignedTo}`
        : "Menunggu admin ditugaskan",
      timestamp: ticket.value.assignedTo ? ticket.value.updatedAt : null,
      isCompleted: ["in-progress", "resolved"].includes(ticket.value.status),
      isCurrent: ticket.value.status === "in-progress",
    },
    {
      id: 3,
      label: "Resolved",
      status: "resolved",
      icon: CheckCircle,
      description: "Masalah diselesaikan",
      timestamp: ticket.value.resolvedAt || null,
      isCompleted: ticket.value.status === "resolved",
      isCurrent: ticket.value.status === "resolved",
    },
  ];

  return steps;
});

const getStepColorClass = (step: any) => {
  if (step && step.isCompleted) {
    if (step.status === "open") return "bg-blue-500 border-blue-500";
    if (step.status === "in-progress") return "bg-yellow-500 border-yellow-500";
    if (step.status === "resolved") return "bg-green-500 border-green-500";
  }
  return "bg-gray-200 border-gray-300";
};

const getStepTextColor = (step: any) => {
  if (step.isCurrent) {
    if (step.status === "open") return "text-blue-700";
    if (step.status === "in-progress") return "text-yellow-700";
    if (step.status === "resolved") return "text-green-700";
  }
  return step.isCompleted ? "text-gray-700" : "text-gray-400";
};

const getStepBgColor = (step: any) => {
  if (step.isCurrent) {
    if (step.status === "open") return "bg-blue-50 border-blue-200";
    if (step.status === "in-progress") return "bg-yellow-50 border-yellow-200";
    if (step.status === "resolved") return "bg-green-50 border-green-200";
  }
  return "";
};

onMounted(() => {
  loadTicketDetail();
});
</script>

<template>
  <div>
    <!-- Toast Notification -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div v-if="toast.show" class="fixed top-4 right-4 z-50 max-w-md">
        <div
          class="rounded-lg shadow-lg p-4 flex items-center gap-3"
          :class="
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          "
        >
          <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5" />
          <XCircle v-else class="w-5 h-5" />
          <span class="font-medium">{{ toast.message }}</span>
        </div>
      </div>
    </Transition>

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
      class="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-8 text-center shadow-lg"
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
      <div
        class="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <span
                class="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full"
              >
                {{ ticket.id }}
              </span>
              <span
                class="px-3 py-1 rounded-full text-xs font-medium capitalize"
                :class="getRoleBadgeClass(ticket.role)"
              >
                {{ ticket.role }}
              </span>
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="getStatusBadgeClass(ticket.status)"
              >
                {{ getStatusLabel(ticket.status) }}
              </span>
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="getPriorityBadgeClass(ticket.priority)"
              >
                {{ getPriorityLabel(ticket.priority) }}
              </span>
            </div>
            <h1 class="text-3xl font-bold text-gray-800 mb-3 leading-tight">
              {{ ticket.title }}
            </h1>
            <p class="text-gray-600 leading-relaxed">
              {{ ticket.description }}
            </p>
          </div>
        </div>

        <!-- Resolved Info -->
        <Transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
        >
          <div
            v-if="ticket.status === 'resolved'"
            class="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-lg shadow-sm"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <CheckCircle class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-green-800 mb-1">
                  ✓ Tiket Telah Di-resolve
                </p>
                <p class="text-xs text-green-700 mb-2">
                  Masalah telah diselesaikan. Jika masih ada keluhan atau
                  pertanyaan baru, silakan buat tiket baru.
                </p>
                <button
                  class="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
                  @click="showNewTicketModal = true"
                >
                  <Plus class="w-4 h-4" />
                  Buat Tiket Baru
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Process Info Card -->
        <div
          class="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
        >
          <h3
            class="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2"
          >
            <Bell class="w-4 h-4" />
            Alur Proses Tiket
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div class="flex items-start gap-2">
              <div
                class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
              >
                1
              </div>
              <div>
                <span class="font-semibold text-blue-800">Open:</span>
                <span class="text-blue-700">
                  Tiket dibuat dan menunggu penugasan</span
                >
              </div>
            </div>
            <div class="flex items-start gap-2">
              <div
                class="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
              >
                2
              </div>
              <div>
                <span class="font-semibold text-yellow-800">In Progress:</span>
                <span class="text-yellow-700">
                  Admin menangani dan mengirim solusi</span
                >
              </div>
            </div>
            <div class="flex items-start gap-2">
              <div
                class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
              >
                3
              </div>
              <div>
                <span class="font-semibold text-green-800">Resolved:</span>
                <span class="text-green-700">
                  Masalah selesai, buat tiket baru jika perlu</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column - Info Card -->
        <div
          class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h2
            class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"
          >
            <FileText class="w-5 h-5 text-green-600" />
            Detail Informasi
          </h2>
          <div class="grid grid-cols-1 gap-4">
            <div
              class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div
                class="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm"
              >
                <Tag class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="text-xs text-blue-600 font-medium mb-1">Kategori</p>
                <p class="text-sm font-bold text-gray-800">
                  {{ ticket.category }}
                </p>
              </div>
            </div>

            <div
              class="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div
                class="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center shadow-sm"
              >
                <Calendar class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="text-xs text-green-600 font-medium mb-1">Dibuat</p>
                <p class="text-sm font-bold text-gray-800">
                  {{ formatDate(ticket.createdAt) }}
                </p>
              </div>
            </div>

            <div
              v-if="ticket.status !== 'open'"
              class="flex items-center gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div
                class="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center shadow-sm"
              >
                <User class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="text-xs text-orange-600 font-medium mb-1">
                  Ditugaskan ke
                </p>
                <p class="text-sm font-bold text-gray-800">
                  {{ ticket.assignedTo || "-" }}
                </p>
              </div>
            </div>

            <div
              v-if="ticket.resolvedAt"
              class="flex items-center gap-3 p-3 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <div
                class="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center shadow-sm"
              >
                <CheckCircle class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="text-xs text-teal-600 font-medium mb-1">Di-resolve</p>
                <p class="text-sm font-bold text-gray-800">
                  {{ formatDate(ticket.resolvedAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Middle Column - Status Stepper -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2
            class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"
          >
            <Clock class="w-5 h-5 text-green-600" />
            Progress Tiket
          </h2>

          <!-- Stepper -->
          <div class="relative">
            <!-- Vertical Line -->
            <div
              class="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"
              aria-hidden="true"
            ></div>

            <!-- Steps -->
            <div class="space-y-6">
              <div
                v-for="(step, index) in ticketSteps"
                :key="step.id"
                class="relative"
              >
                <div class="flex items-start gap-4">
                  <!-- Step Circle with Icon -->
                  <div class="relative flex-shrink-0 z-10">
                    <div
                      class="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-sm"
                      :class="[
                        getStepColorClass(step),
                        step.isCurrent ? 'ring-4 ring-opacity-30' : '',
                        step.status === 'open' && step.isCurrent
                          ? 'ring-blue-200'
                          : '',
                        step.status === 'in-progress' && step.isCurrent
                          ? 'ring-yellow-200'
                          : '',
                        step.status === 'resolved' && step.isCurrent
                          ? 'ring-green-200'
                          : '',
                      ]"
                    >
                      <component
                        :is="step.icon"
                        class="w-5 h-5 transition-all duration-300"
                        :class="
                          step.isCompleted ? 'text-white' : 'text-gray-400'
                        "
                      />
                    </div>

                    <!-- Pulse Animation for Current Step -->
                    <div
                      v-if="step.isCurrent"
                      class="absolute inset-0 rounded-full animate-ping opacity-20"
                      :class="[
                        step.status === 'open'
                          ? 'bg-blue-500'
                          : step.status === 'in-progress'
                          ? 'bg-yellow-500'
                          : 'bg-green-500',
                      ]"
                    ></div>
                  </div>

                  <!-- Step Content -->
                  <div class="flex-1 min-w-0 pb-6">
                    <div
                      class="rounded-lg p-4 transition-all duration-300 border"
                      :class="getStepBgColor(step)"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <h3
                          class="text-sm font-bold transition-colors duration-300"
                          :class="getStepTextColor(step)"
                        >
                          {{ step.label }}
                        </h3>
                        <span
                          v-if="step.isCurrent"
                          class="px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse"
                          :class="[
                            step.status === 'open'
                              ? 'bg-blue-100 text-blue-700'
                              : step.status === 'in-progress'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700',
                          ]"
                        >
                          Saat Ini
                        </span>
                        <CheckCircle
                          v-else-if="step.isCompleted"
                          class="w-4 h-4 text-green-600"
                        />
                      </div>

                      <p
                        class="text-xs mb-2 transition-colors duration-300"
                        :class="
                          step.isCompleted ? 'text-gray-600' : 'text-gray-400'
                        "
                      >
                        {{ step.description }}
                      </p>

                      <div
                        v-if="step.timestamp"
                        class="flex items-center gap-1 text-xs"
                        :class="
                          step.isCompleted ? 'text-gray-500' : 'text-gray-400'
                        "
                      >
                        <Clock class="w-3 h-3" />
                        <span>{{ formatDate(step.timestamp) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Connector Line (except for last item) -->
                <div
                  v-if="index < ticketSteps.length - 1"
                  class="absolute left-6 top-12 w-0.5 h-6 transition-colors duration-300"
                  :class="
                    ticketSteps[index + 1]?.isCompleted
                      ? 'bg-green-400'
                      : 'bg-gray-200'
                  "
                ></div>
              </div>
            </div>
          </div>

          <!-- Activity Log -->
          <!-- <div class="mt-8 pt-6 border-t border-gray-200">
            <h3
              class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"
            >
              <Bell class="w-4 h-4" />
              Riwayat Aktivitas
            </h3>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div
                v-for="activity in activityLog"
                :key="activity.id"
                class="flex items-start gap-2 text-xs"
              >
                <div
                  class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <component
                    :is="activity.icon"
                    class="w-3 h-3 text-gray-600"
                  />
                </div>
                <div class="flex-1">
                  <p class="text-gray-800 font-medium">
                    {{ activity.action }}
                  </p>
                  <p class="text-gray-500">
                    {{ activity.user }} •
                    {{ formatDate(activity.timestamp) }}
                  </p>
                </div>
              </div>
            </div>
          </div> -->
        </div>

        <!-- Right Column - Quick Actions -->
        <div class="space-y-6">
          <!-- Quick Actions Card -->
          <div
            class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 shadow-sm sticky top-6"
          >
            <h2
              class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"
            >
              <Bell class="w-5 h-5 text-green-600" />
              Aksi Cepat
            </h2>
            <div class="space-y-3">
              <!-- Assign Ticket (only for open status) -->
              <button
                v-if="ticket.status === 'open'"
                class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                :disabled="updating"
                @click="showAssignModal = true"
              >
                <UserPlus class="w-5 h-5" />
                <span>Tugaskan ke Admin</span>
              </button>

              <!-- Send Email (only for in-progress) -->
              <button
                v-if="ticket.status === 'in-progress'"
                class="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                :disabled="updating"
                @click="showEmailModal = true"
              >
                <Mail class="w-5 h-5" />
                <span>Kirim Email</span>
              </button>

              <!-- Create New Ticket (only for resolved) -->
              <button
                v-if="ticket.status === 'resolved'"
                class="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                @click="showNewTicketModal = true"
              >
                <Plus class="w-5 h-5" />
                <span>Buat Tiket Baru</span>
              </button>

              <!-- Divider -->
              <div class="border-t border-green-200 my-4"></div>

              <!-- Print -->
              <button
                class="w-full px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow"
              >
                <FileText class="w-5 h-5" />
                <span>Cetak Tiket</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Modal -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showAssignModal"
        class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showAssignModal = false"
      >
        <div
          class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all"
          @click.stop
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center"
            >
              <UserPlus class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-800">Tugaskan Tiket</h3>
          </div>
          <p class="text-sm text-gray-600 mb-4">
            Masukkan email admin yang akan menangani tiket ini. Status akan
            otomatis berubah menjadi "In Progress".
          </p>
          <input
            v-model="assigneeEmail"
            type="email"
            placeholder="admin@example.com"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4 transition-all"
          />
          <div class="flex gap-3">
            <button
              class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              :disabled="updating"
              @click="showAssignModal = false"
            >
              Batal
            </button>
            <button
              class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:opacity-50 shadow-md"
              :disabled="updating"
              @click="handleAssignTicket"
            >
              {{ updating ? "Memproses..." : "Tugaskan" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Email Modal -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showEmailModal"
        class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showEmailModal = false"
      >
        <div
          class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          @click.stop
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Mail class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-800">Kirim Email Balasan</h3>
          </div>
          <p class="text-sm text-gray-600 mb-4">
            Email akan dikirim kepada customer. Anda bisa memilih untuk
            me-resolve tiket setelah mengirim email.
          </p>

          <label
            class="flex items-center gap-3 mb-4 p-3 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-colors"
          >
            <input
              v-model="shouldResolveAfterEmail"
              type="checkbox"
              class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span class="text-sm font-medium text-gray-700"
              >Resolve tiket setelah mengirim email</span
            >
          </label>

          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
          >
            <div
              v-if="shouldResolveAfterEmail"
              class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-lg mb-4"
            >
              <p class="text-xs text-blue-800 flex items-start gap-2">
                <AlertCircle class="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span
                  >Tiket akan di-resolve. Jika customer masih memiliki masalah,
                  mereka perlu membuat tiket baru.</span
                >
              </p>
            </div>
          </Transition>

          <div class="flex gap-3">
            <button
              class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              :disabled="updating"
              @click="showEmailModal = false"
            >
              Batal
            </button>
            <button
              class="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all font-medium disabled:opacity-50 shadow-md"
              :disabled="updating"
              @click="handleSendEmail"
            >
              {{ updating ? "Mengirim..." : "Kirim Email" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- New Ticket Modal -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showNewTicketModal"
        class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showNewTicketModal = false"
      >
        <div
          class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          @click.stop
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center"
            >
              <Plus class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-800">Buat Tiket Baru</h3>
          </div>
          <p class="text-sm text-gray-600 mb-6">
            Tiket ini sudah di-resolve. Jika Anda masih memiliki masalah atau
            pertanyaan baru, silakan buat tiket baru untuk penanganan yang lebih
            baik.
          </p>

          <div
            class="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-400 rounded-lg mb-6"
          >
            <p class="text-xs text-purple-800 flex items-start gap-2">
              <AlertCircle class="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span
                >Tiket yang sudah resolved tidak dapat dibuka kembali untuk
                menjaga kejelasan dokumentasi.</span
              >
            </p>
          </div>

          <div class="flex gap-3">
            <button
              class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              @click="showNewTicketModal = false"
            >
              Batal
            </button>
            <button
              class="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-md"
              @click="handleCreateNewTicket"
            >
              Buat Tiket Baru
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
