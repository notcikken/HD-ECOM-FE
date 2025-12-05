<script setup lang="ts">
import { Bell, User, CheckCircle, FileText } from "lucide-vue-next";
import type { Ticket } from "~/types/ticket";

interface Props {
  ticket: Ticket;
  updating: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  assign: [];
  resolve: [];
  print: [];
}>();
</script>

<template>
  <div
    class="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 shadow-sm sticky top-6"
  >
    <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
      <Bell class="w-5 h-5 text-green-600" />
      Aksi Cepat
    </h2>
    <div class="space-y-3">
      <!-- Assign Ticket & Set Priority (only for open status) -->
      <button
        v-if="ticket.id_status === 1"
        class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        :disabled="updating"
        @click="emit('assign')"
      >
        <User class="w-5 h-5" />
        <span>Tugaskan & Set Prioritas</span>
      </button>

      <!-- Resolve Ticket (only for in-progress) -->
      <button
        v-if="ticket.id_status === 2"
        class="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        :disabled="updating"
        @click="emit('resolve')"
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
              Tiket ini sudah diselesaikan. Tidak ada aksi lebih lanjut yang
              diperlukan.
            </p>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-green-200 my-4"></div>

      <!-- Print -->
      <button
        class="w-full px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow"
        @click="emit('print')"
      >
        <FileText class="w-5 h-5" />
        <span>Cetak Tiket</span>
      </button>
    </div>
  </div>
</template>
