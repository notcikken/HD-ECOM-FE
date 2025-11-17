<script setup lang="ts">
import { ref } from "vue";
import type { Ticket } from "~/types/ticket";
import { SquareArrowOutUpRight, ChevronDown } from "lucide-vue-next";

const props = defineProps<{
  initialTickets?: Ticket[] | null;
}>();

const sample = [
  {
    id: "T-001",
    title: "Tidak bisa login",
    description: "Saya lupa password dan tidak menerima kode OTP.",
    category: "Akun & Keamanan",
    status: "Queue",
    createdAt: new Date().toISOString(),
    supportingDocuments: ["screenshot.png"],
  },
  {
    id: "T-002",
    title: "Pembayaran gagal",
    description: "Transaksi tidak selesai meskipun saldo terpotong.",
    category: "Pembayaran",
    status: "Resolved",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    supportingDocuments: ["bukti_laporan.jpg"],
  },
];

const tickets = ref<Ticket[]>(
  (props.initialTickets && props.initialTickets.length
    ? props.initialTickets
    : sample) as Ticket[]
);
const openIndex = ref<number | null>(null);

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i;
}

function formatDate(s?: string) {
  if (!s) return "";
  return new Intl.DateTimeFormat("id", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(s));
}

function statusClass(status?: string) {
  switch ((status || "").toLowerCase()) {
    case "queue":
      return "bg-blue-100 text-blue-700";
    case "in progress":
      return "bg-yellow-100 text-yellow-700";
    case "resolved":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
</script>

<template>
  <aside class="mt-6 max-w-7xl bg-white rounded-2xl p-4 border border-gray-100">
    <div class="flex items-center mb-4">
      <h1 class="font-semibold text-gray-800">Daftar Tiket Saya</h1>
      <span class="text-sm text-[#F79E0E] ml-3 py-1.5 px-3 bg-[#F79E0E]/10 rounded-full">{{ tickets.length }}</span>
    </div>

    <div v-if="!tickets.length" class="text-sm text-gray-500">
      Belum ada tiket.
    </div>

    <ul class="space-y-3">
      <li
        v-for="(t, i) in tickets"
        :key="t.id || `${t.title}-${i}`"
        class="p-3 rounded-lg border border-gray-50 hover:bg-gray-50 transition"
      >
        <button
          type="button"
          class="w-full text-left flex items-start gap-3"
          :aria-expanded="openIndex === i"
          @click="toggle(i)"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-3">
              <div class="truncate">
                <div class="text-sm font-medium text-gray-800 truncate">
                  {{ t.title }}
                </div>
                <div class="text-xs text-gray-500 truncate">
                  {{ t.category }}
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <span
                  :class="[
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    statusClass(t.status),
                  ]"
                >
                  {{ t.status }}
                </span>
                <div class="text-xs text-gray-400">
                  {{ formatDate(t.createdAt) }}
                </div>
                <ChevronDown
                  class="w-5 h-5 text-gray-400 transform transition-transform duration-200"
                  :class="{ 'rotate-180': openIndex === i }"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div v-show="openIndex === i" class="text-sm text-gray-600">
              <!-- description -->
              <div class="text-sm font-medium text-gray-800 mt-5">
                Deskripsi:
              </div>
              <div class="mb-3 whitespace-pre-line">{{ t.description }}</div>

              <!-- supporting documents -->
              <div v-if="t.supportingDocuments?.length" class="mb-4">
                <ul class="space-y-1">
                  <div class="text-sm font-medium text-gray-800 mb-1">
                    Dokumen Pendukung:
                  </div>
                  <li
                    v-for="(a, idx) in t.supportingDocuments"
                    :key="idx"
                    class="text-xs text-gray-600 flex items-center justify-between gap-2 border border-1 bg-gray-50 p-2 rounded"
                  >
                    <span class="truncate">{{ a }}</span>
                    <a
                      :href="
                        (a &&
                          (a.startsWith('http') || a.startsWith('/')
                            ? a
                            : `${a}`)) ||
                        '#'
                      "
                      target="_blank"
                      rel="noopener"
                    >
                      <SquareArrowOutUpRight class="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </a>
                  </li>
                </ul>
              </div>
              <!-- Response/Message Admin -->
              <div class="mt-4 p-3 bg-[#F79E0E]/10 rounded">
                <div class="text-sm font-medium text-[#F79E0E]">
                  Balasan:
                </div>
                <div class="text-sm text-[#F79E0E]">
                  Terima kasih telah menghubungi kami. Kami akan segera meninjau
                  masalah Anda dan memberikan solusi secepatnya.
                </div>
              </div>
            </div>
          </div>
        </button>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
/* small animation for show/hide */
[v-cloak] {
  display: none;
}
</style>
