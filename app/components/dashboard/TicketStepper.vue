<!-- eslint-disable @typescript-eslint/no-explicit-any -->

<script setup lang="ts">
import { Clock, FileText, User, CheckCircle } from "lucide-vue-next";
import type { Ticket } from "~/types/ticket";

interface Props {
  ticket: Ticket;
}

const props = defineProps<Props>();

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ticketSteps = computed(() => {
  if (!props.ticket) return [];

  const steps = [
    {
      id: 1,
      label: "Open",
      status: "open",
      icon: FileText,
      description: "Tiket dibuat dan menunggu penugasan",
      timestamp: props.ticket.tanggal_dibuat,
      isCompleted: true,
      isCurrent: props.ticket.status === "open",
    },
    {
      id: 2,
      label: "In Progress",
      status: "in-progress",
      icon: User,
      description: props.ticket.assignedTo
        ? `Ditangani oleh ${props.ticket.assignedTo}`
        : "Menunggu admin ditugaskan",
      timestamp: props.ticket.assignedTo ? props.ticket.updatedAt : null,
      isCompleted: ["in-progress", "resolved"].includes(props.ticket.status),
      isCurrent: props.ticket.status === "in-progress",
    },
    {
      id: 3,
      label: "Resolved",
      status: "resolved",
      icon: CheckCircle,
      description: "Masalah diselesaikan",
      timestamp: props.ticket.resolvedAt || null,
      isCompleted: props.ticket.status === "resolved",
      isCurrent: props.ticket.status === "resolved",
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
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <h2 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
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
                  :class="step.isCompleted ? 'text-white' : 'text-gray-400'"
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
                  :class="step.isCompleted ? 'text-gray-600' : 'text-gray-400'"
                >
                  {{ step.description }}
                </p>

                <div
                  v-if="step.timestamp"
                  class="flex items-center gap-1 text-xs"
                  :class="step.isCompleted ? 'text-gray-500' : 'text-gray-400'"
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
</template>
