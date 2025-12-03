<script setup lang="ts">
import { ref, watch } from "vue";
import type { Ticket } from "~/types/ticket";
import { 
  SquareArrowOutUpRight, 
  ChevronDown, 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Loader2,
  Shield,
  CreditCard,
  Truck,
  PackageX,
  Wrench,
  Package
} from "lucide-vue-next";
import { useTicketApi } from "~/composables/useTicketApi";

interface TicketCategory {
  category: string;
  tickets: Ticket[];
  count: number;
}

interface TicketAttachment {
  attachment: {
    id_attachment: number;
    id_ticket: number;
    file_path: string;
    uploaded_at: string;
  };
  download_url: string;
}

interface Props {
  initialTickets?: Ticket[] | null;
  ticketsByCategory?: TicketCategory[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialTickets: () => [],
  ticketsByCategory: () => [],
  loading: false,
});

const { fetchTicketAttachments } = useTicketApi();

const expandedCategories = ref<Set<string>>(new Set());
const openTicketIndex = ref<string | null>(null);
const ticketAttachments = ref<Map<number, TicketAttachment[]>>(new Map());
const loadingAttachments = ref<Set<number>>(new Set());

// Auto-expand first category when tickets load
watch(
  () => props.ticketsByCategory,
  (newCategories) => {
    if (newCategories.length > 0 && expandedCategories.value.size === 0) {
      expandedCategories.value.add(newCategories[0].category);
    }
  },
  { immediate: true }
);

function toggleCategory(category: string) {
  if (expandedCategories.value.has(category)) {
    expandedCategories.value.delete(category);
  } else {
    // Close all other categories and open only this one
    expandedCategories.value.clear();
    expandedCategories.value.add(category);
  }
}

async function toggleTicket(ticketId: number) {
  const ticketIdStr = `${ticketId}`;
  
  if (openTicketIndex.value === ticketIdStr) {
    openTicketIndex.value = null;
  } else {
    openTicketIndex.value = ticketIdStr;
    
    // Fetch attachments if not already loaded
    if (!ticketAttachments.value.has(ticketId) && !loadingAttachments.value.has(ticketId)) {
      loadingAttachments.value.add(ticketId);
      
      try {
        const response = await fetchTicketAttachments(ticketId);
        if (response.success) {
          ticketAttachments.value.set(ticketId, response.data);
        }
      } catch (error) {
        console.error('Failed to load attachments:', error);
      } finally {
        loadingAttachments.value.delete(ticketId);
      }
    }
  }
}

function formatDate(s?: string) {
  if (!s) return "";
  return new Intl.DateTimeFormat("id", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(s));
}

function statusClass(statusId?: number) {
  switch (statusId) {
    case 1: // Queue/Open
      return "bg-blue-100 text-blue-700";
    case 2: // In Progress
      return "bg-yellow-100 text-yellow-700";
    case 3: // Resolved
      return "bg-green-100 text-green-700";
    case 4: // Closed
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function statusLabel(statusId?: number) {
  switch (statusId) {
    case 1:
      return "Queue";
    case 2:
      return "In Progress";
    case 3:
      return "Resolved";
    case 4:
      return "Closed";
    default:
      return "Unknown";
  }
}

function getFileType(filePath: string): 'image' | 'pdf' | 'other' {
  const extension = filePath.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
    return 'image';
  }
  if (extension === 'pdf') {
    return 'pdf';
  }
  return 'other';
}

function getFileName(filePath: string): string {
  return filePath.split('/').pop() || filePath;
}

function getCategoryIcon(categoryName: string) {
  const lowerCategory = categoryName.toLowerCase();
  
  if (lowerCategory.includes('akun') || lowerCategory.includes('keamanan')) {
    return Shield;
  }
  if (lowerCategory.includes('pembayaran')) {
    return CreditCard;
  }
  if (lowerCategory.includes('pengiriman')) {
    return Truck;
  }
  if (lowerCategory.includes('pengembalian')) {
    return PackageX;
  }
  if (lowerCategory.includes('teknis') || lowerCategory.includes('aplikasi')) {
    return Wrench;
  }
  if (lowerCategory.includes('produk')) {
    return Package;
  }
  
  return Folder;
}
</script>

<template>
  <aside class="mt-6 max-w-7xl bg-white rounded-2xl p-4 border border-gray-100">
    <div class="flex items-center mb-4">
      <h1 class="font-semibold text-gray-800">Daftar Tiket Saya</h1>
      <span
        class="text-sm text-[#F79E0E] ml-3 py-1.5 px-3 bg-[#F79E0E]/10 rounded-full"
      >
        {{ initialTickets?.length || 0 }}
      </span>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F79E0E] mx-auto"></div>
      <p class="mt-2 text-sm">Loading tickets...</p>
    </div>

    <div
      v-else-if="!ticketsByCategory.length"
      class="text-sm text-gray-500 text-center py-8"
    >
      Belum ada tiket.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="group in ticketsByCategory"
        :key="group.category"
        class="border border-gray-200 rounded-lg overflow-hidden"
      >
        <!-- Category Header -->
        <button
          type="button"
          @click="toggleCategory(group.category)"
          class="w-full px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <component :is="getCategoryIcon(group.category)" :size="16" class="text-[#F79E0E]" />
            <span class="font-semibold text-sm text-gray-700">
              {{ group.category }}
            </span>
            <span class="text-xs bg-[#F79E0E] text-white px-2 py-0.5 rounded-full">
              {{ group.count }}
            </span>
          </div>
          <ChevronDown
            :size="16"
            class="text-gray-400 transform transition-transform duration-200"
            :class="{ 'rotate-180': expandedCategories.has(group.category) }"
          />
        </button>

        <!-- Tickets List -->
        <ul
          v-show="expandedCategories.has(group.category)"
          class="divide-y divide-gray-100"
        >
          <li
            v-for="ticket in group.tickets"
            :key="ticket.id_ticket"
            class="p-3 hover:bg-gray-50 transition"
          >
            <button
              type="button"
              class="w-full text-left"
              @click="toggleTicket(ticket.id_ticket)"
            >
              <div class="flex items-center justify-between gap-3 mb-2">
                <div class="truncate flex-1">
                  <div class="text-sm font-medium text-gray-800 truncate">
                    {{ ticket.judul }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ ticket.kode_tiket }}
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <span
                    :class=" [
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      statusClass(ticket.id_status),
                    ]"
                  >
                    {{ statusLabel(ticket.id_status) }}
                  </span>
                  <div class="text-xs text-gray-400">
                    {{ formatDate(ticket.tanggal_dibuat) }}
                  </div>
                  <ChevronDown
                    class="w-4 h-4 text-gray-400 transform transition-transform duration-200"
                    :class="{ 'rotate-180': openTicketIndex === `${ticket.id_ticket}` }"
                  />
                </div>
              </div>

              <!-- Expanded Content -->
              <div
                v-show="openTicketIndex === `${ticket.id_ticket}`"
                class="text-sm text-gray-600 mt-3 space-y-4"
              >
                <!-- Description -->
                <div>
                  <div class="text-sm font-medium text-gray-800 mb-1">
                    Deskripsi:
                  </div>
                  <div class="whitespace-pre-line text-gray-600">{{ ticket.deskripsi }}</div>
                </div>

                <!-- Attachments from API -->
                <div v-if="loadingAttachments.has(ticket.id_ticket)">
                  <div class="flex items-center gap-2 text-gray-500">
                    <Loader2 class="w-4 h-4 animate-spin" />
                    <span class="text-sm">Loading attachments...</span>
                  </div>
                </div>

                <div v-else-if="ticketAttachments.get(ticket.id_ticket)?.length">
                  <div class="text-sm font-medium text-gray-800 mb-2">
                    Lampiran ({{ ticketAttachments.get(ticket.id_ticket)?.length }}):
                  </div>
                  
                  <div class="grid grid-cols-2 gap-2">
                    <a
                      v-for="attachment in ticketAttachments.get(ticket.id_ticket)"
                      :key="attachment.attachment.id_attachment"
                      :href="attachment.download_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="group relative border border-gray-200 rounded-lg overflow-hidden hover:border-[#F79E0E] hover:shadow-md transition-all"
                    >
                      <div 
                        v-if="getFileType(attachment.attachment.file_path) === 'image'"
                        class="aspect-video bg-gray-100 relative"
                      >
                        <img
                          :src="attachment.download_url"
                          :alt="getFileName(attachment.attachment.file_path)"
                          class="w-full h-full object-cover group-hover:brightness-75 transition-all"
                        />
                        <Download class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div 
                        v-else-if="getFileType(attachment.attachment.file_path) === 'pdf'"
                        class="aspect-video bg-red-50 relative flex items-center justify-center"
                      >
                        <FileText class="w-12 h-12 text-red-500" />
                        <Download class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div 
                        v-else
                        class="aspect-video bg-gray-50 relative flex items-center justify-center"
                      >
                        <FileText class="w-12 h-12 text-gray-400" />
                        <Download class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div class="p-2 bg-white border-t border-gray-200">
                        <div class="text-xs font-medium text-gray-700 truncate">
                          {{ getFileName(attachment.attachment.file_path) }}
                        </div>
                        <div class="text-xs text-gray-500 mt-0.5">
                          {{ formatDate(attachment.attachment.uploaded_at) }}
                        </div>
                      </div>
                    </a>
                  </div>
                </div>

                <div class="p-3 bg-[#F79E0E]/10 rounded-lg">
                  <div class="text-sm font-medium text-[#F79E0E] mb-1">Balasan:</div>
                  <div class="text-sm text-[#F79E0E]">
                    Terima kasih telah menghubungi kami. Kami akan segera meninjau
                    masalah Anda dan memberikan solusi secepatnya.
                  </div>
                </div>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* small animation for show/hide */
[v-cloak] {
  display: none;
}
</style>
