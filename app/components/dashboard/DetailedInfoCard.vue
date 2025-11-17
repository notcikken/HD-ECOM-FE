<script setup lang="ts">
import { Tag, Calendar, User, CheckCircle } from "lucide-vue-next";
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
</script>

<template>
  <div
    class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
  >
    <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
      <Tag class="w-5 h-5 text-green-600" />
      Detail Informasi
    </h2>
    <div class="grid grid-cols-1 gap-4">
      <!-- Kategori -->
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
          <p class="text-sm font-bold text-gray-800">{{ ticket.category }}</p>
        </div>
      </div>

      <!-- Dibuat -->
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

      <!-- Ditangani oleh (if assigned) -->
      <div
        v-if="ticket.assignedTo"
        class="flex items-center gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
      >
        <div
          class="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center shadow-sm"
        >
          <User class="w-5 h-5 text-white" />
        </div>
        <div>
          <p class="text-xs text-orange-600 font-medium mb-1">Ditangani oleh</p>
          <p class="text-sm font-bold text-gray-800">{{ ticket.assignedTo }}</p>
        </div>
      </div>

      <!-- Di-resolve pada (if resolved) -->
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
          <p class="text-xs text-teal-600 font-medium mb-1">Di-resolve pada</p>
          <p class="text-sm font-bold text-gray-800">
            {{ formatDate(ticket.resolvedAt) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
