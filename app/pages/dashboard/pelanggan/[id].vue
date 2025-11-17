<!-- eslint-disable @typescript-eslint/no-explicit-any -->

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  ArrowLeft,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  FileText,
  Bell,
  MessageSquare,
  Image as ImageIcon, // 👈 Import icon untuk gambar
  File, // 👈 Import icon untuk PDF
  FileCode, // 👈 Import icon untuk TXT
  Download,
} from "lucide-vue-next";
import ActionModal from "~/components/actionModal.vue";
import type { Ticket } from "~/types/ticket";
import DetailedInfoCard from "~/components/dashboard/DetailedInfoCard.vue";

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

const getFileType = (
  fileName: string
): "pdf" | "image" | "text" | "unknown" => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || ""))
    return "image";
  if (extension === "txt") return "text";

  return "unknown";
};

const getFileIcon = (fileName: string) => {
  const type = getFileType(fileName);

  switch (type) {
    case "pdf":
      return File;
    case "image":
      return ImageIcon;
    case "text":
      return FileCode;
    default:
      return FileText;
  }
};

const getFileColor = (fileName: string) => {
  const type = getFileType(fileName);

  switch (type) {
    case "pdf":
      return {
        bg: "bg-red-50",
        hover: "hover:bg-red-100",
        icon: "bg-red-500",
        text: "text-red-700",
        border: "border-red-200",
      };
    case "image":
      return {
        bg: "bg-blue-50",
        hover: "hover:bg-blue-100",
        icon: "bg-blue-500",
        text: "text-blue-700",
        border: "border-blue-200",
      };
    case "text":
      return {
        bg: "bg-purple-50",
        hover: "hover:bg-purple-100",
        icon: "bg-purple-500",
        text: "text-purple-700",
        border: "border-purple-200",
      };
    default:
      return {
        bg: "bg-gray-50",
        hover: "hover:bg-gray-100",
        icon: "bg-gray-500",
        text: "text-gray-700",
        border: "border-gray-200",
      };
  }
};

const getFileName = (filePath: string) => {
  return filePath.split("/").pop() || filePath;
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
      icon: User,
      description: ticket.value.assignedTo
        ? `Ditangani oleh ${ticket.value.assignedTo}`
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
    if (step.isCurrent) {
      if (step.status === "open") return "bg-blue-500 border-blue-500";
      if (step.status === "in-progress")
        return "bg-yellow-500 border-yellow-500";
      if (step.status === "resolved") return "bg-green-500 border-green-500";
    }
    return "bg-green-500 border-green-400";
  }
  return "bg-gray-200 border-gray-400";
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
  if (step && step.isCompleted) {
    if (step.isCurrent) {
      if (step.status === "open") return "bg-blue-50 border-blue-200";
      if (step.status === "in-progress")
        return "bg-yellow-50 border-yellow-200";
      if (step.status === "resolved") return "bg-green-50 border-green-200";
    }
    return "bg-green-50 border-green-200";
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
      <div
        class="bg-linear-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
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
              <!-- Show Priority only if assigned -->
              <span
                v-if="ticket.priority"
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="getPriorityBadgeClass(ticket.priority)"
              >
                {{ getPriorityLabel(ticket.priority) }}
              </span>
            </div>
            <h1 class="text-3xl font-bold text-gray-800 leading-tight">
              {{ ticket.title }}
            </h1>
            <p class="text-sm text-gray-500 mb-3 mt-2 ml-1 italic">
              Created by :
              <span class="text-indigo-400 font-medium">
                {{ ticket.createdBy || "Unknown User" }}
              </span>
            </p>
            <p class="text-gray-600 leading-relaxed">
              {{ ticket.description }}
            </p>
            <!-- Supporting Documents (if any) -->
            <div
              v-if="
                ticket.supportingDocuments &&
                ticket.supportingDocuments.length > 0
              "
              class="mt-4"
            >
              <div class="flex items-center gap-2 mb-3">
                <FileText class="w-4 h-4 text-gray-600" />
                <h3 class="text-sm font-semibold text-gray-700">
                  Dokumen Pendukung
                </h3>
              </div>

              <!-- Grid of Documents -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <a
                  v-for="(doc, index) in ticket.supportingDocuments"
                  :key="index"
                  :href="doc"
                  target="_blank"
                  class="group relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200"
                  :class="[
                    getFileColor(doc).bg,
                    getFileColor(doc).hover,
                    getFileColor(doc).border,
                    'hover:shadow-md hover:scale-[1.02]',
                  ]"
                >
                  <!-- File Icon -->
                  <div
                    class="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-110"
                    :class="getFileColor(doc).icon"
                  >
                    <component
                      :is="getFileIcon(doc)"
                      class="w-5 h-5 text-white"
                    />
                  </div>

                  <!-- File Info -->
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-xs font-semibold mb-0.5 truncate"
                      :class="getFileColor(doc).text"
                    >
                      {{ getFileName(doc) }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ getFileType(doc).toUpperCase() }}
                    </p>
                  </div>

                  <!-- Download Icon (visible on hover) -->
                  <div
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download class="w-4 h-4 text-gray-600" />
                  </div>

                  <!-- Hover Effect Badge -->
                  <div
                    class="absolute top-1 right-1 px-2 py-0.5 bg-white rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    :class="getFileColor(doc).text"
                  >
                    View
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Resolution Info (only for resolved tickets) -->
        <!-- <Transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
        >
          <div
            v-if="ticket.status === 'resolved' && ticket.resolution"
            class="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-lg shadow-sm"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0"
              >
                <CheckCircle class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1 justify-center">
                <p
                  class="flex items-centertext-sm font-semibold text-green-800 mb-2"
                >
                  ✓ Tiket Telah Di-resolve
                </p>
              </div>
            </div>
          </div>
        </Transition> -->

        <!-- Process Info Card -->
        <!-- <div
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
                class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0 text-white font-bold"
              >
                1
              </div>
              <div>
                <span class="font-semibold text-blue-800">Open:</span>
                <span class="text-blue-700">
                  Admin menugaskan pegawai dan set prioritas</span
                >
              </div>
            </div>
            <div class="flex items-start gap-2">
              <div
                class="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shrink-0 text-white font-bold"
              >
                2
              </div>
              <div>
                <span class="font-semibold text-yellow-800">In Progress:</span>
                <span class="text-yellow-700">
                  Pegawai menangani masalah customer</span
                >
              </div>
            </div>
            <div class="flex items-start gap-2">
              <div
                class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0 text-white font-bold"
              >
                3
              </div>
              <div>
                <span class="font-semibold text-green-800">Resolved:</span>
                <span class="text-green-700">
                  Masalah selesai dengan solusi</span
                >
              </div>
            </div>
          </div>
        </div> -->
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column - Info Card -->
        <DetailedInfoCard :ticket="ticket" />

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
                  <div class="relative shrink-0 z-10">
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
                          v-else-if="step.isCompleted && !step.isCurrent"
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
                  v-if="index < ticketSteps.length - 1 && step.isCompleted"
                  class="absolute left-6 top-12 w-0.5 h-full transition-colors duration-300"
                  :class="
                    ticketSteps[index + 1]?.isCompleted
                      ? 'bg-green-400'
                      : 'bg-gray-200'
                  "
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Quick Actions -->
        <div class="space-y-6">
          <!-- Quick Actions Card -->
          <div
            class="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 shadow-sm sticky top-6"
          >
            <h2
              class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"
            >
              <Bell class="w-5 h-5 text-green-600" />
              Aksi Cepat
            </h2>
            <div class="space-y-3">
              <!-- Assign Ticket & Set Priority (only for open status) -->
              <button
                v-if="ticket.status === 'open'"
                class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                :disabled="updating"
                @click="showAssignModal = true"
              >
                <User class="w-5 h-5" />
                <span>Tugaskan & Set Prioritas</span>
              </button>

              <!-- Resolve Ticket (only for in-progress) -->
              <button
                v-if="ticket.status === 'in-progress'"
                class="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                :disabled="updating"
                @click="showResolveModal = true"
              >
                <CheckCircle class="w-5 h-5" />
                <span>Resolve Tiket</span>
              </button>

              <!-- Info for Resolved Status -->
              <div
                v-if="ticket.status === 'resolved'"
                class="p-4 bg-white rounded-xl border-2 border-green-200"
              >
                <div class="flex items-start gap-3">
                  <div
                    class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0"
                  >
                    <CheckCircle class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-800 mb-1">
                      Tiket Selesai
                    </p>
                    <p class="text-xs text-gray-600">
                      Tiket ini sudah diselesaikan. Tidak ada aksi lebih lanjut
                      yang diperlukan.
                    </p>
                  </div>
                </div>
              </div>

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
