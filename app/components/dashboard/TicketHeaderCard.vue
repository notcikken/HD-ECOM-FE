<script setup lang="ts">
import {
  FileText,
  Image as ImageIcon,
  File,
  Download,
  Loader2,
} from "lucide-vue-next";
import type { Ticket, TicketAttachment } from "~/types/ticket";
import {
  getRoleBadgeClass,
  getStatusBadgeClass,
  getStatusLabel,
  getPriorityBadgeClass,
  getPriorityLabel,
} from "~/utils/convertTicket";

interface Props {
  ticket: Ticket;
}

const props = defineProps<Props>();

const { fetchTicketAttachments } = useTicketApi();
const attachments = ref<TicketAttachment[]>([]);
const loadingAttachments = ref(false);

// Fetch attachments when component mounts
onMounted(async () => {
  if (props.ticket?.id_ticket) {
    loadingAttachments.value = true;
    try {
      const response = await fetchTicketAttachments(
        Number(props.ticket.id_ticket)
      );
      if (response.success) {
        attachments.value = response.data;
        console.log("Attachments loaded:", response.data); // Debug log
      }
    } catch (error) {
      console.error("Failed to load attachments:", error);
    } finally {
      loadingAttachments.value = false;
    }
  }
});

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

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("id", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(dateString));
};

// Helper to handle image load errors
// const handleImageError = (event: Event) => {
//   const img = event.target as HTMLImageElement;
//   console.error("Image failed to load:", img.src);
// };
</script>

<template>
  <div
    class="bg-linear-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
  >
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex flex-wrap items-center gap-2 mb-3">
          <span
            class="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full"
          >
            {{ ticket.kode_tiket }}
          </span>
          <span
            class="px-3 py-1 rounded-full text-xs font-medium capitalize"
            :class="getRoleBadgeClass(ticket.tipe_pengaduan)"
          >
            {{ ticket.tipe_pengaduan }}
          </span>
          <span
            class="px-3 py-1 rounded-full text-xs font-semibold"
            :class="getStatusBadgeClass(getStatusLabel(ticket.id_status))"
          >
            {{ getStatusLabel(ticket.id_status) }}
          </span>
          <!-- Show Priority only if assigned -->
          <span
            class="px-3 py-1 rounded-full text-xs font-semibold"
            :class="getPriorityBadgeClass(getPriorityLabel(ticket.id_priority))"
          >
            {{ getPriorityLabel(ticket.id_priority) }}
          </span>
        </div>
        <h1 class="text-3xl font-bold text-gray-800 leading-tight">
          {{ ticket.judul }}
        </h1>
        <p class="text-sm text-gray-500 mb-3 mt-2 ml-1 italic">
          Created by :
          <span class="text-indigo-400 font-medium">
            {{ ticket.username || "Unknown User" }}
          </span>
        </p>
        <p class="text-gray-600 leading-relaxed">
          {{ ticket.deskripsi }}
        </p>

        <!-- Attachments Section -->
        <div v-if="attachments && attachments.length > 0" class="mt-6">
          <div class="flex items-center gap-2 mb-4">
            <FileText class="w-5 h-5 text-gray-600" />
            <h3 class="text-base font-semibold text-gray-800">
              Lampiran
              <span
                v-if="!loadingAttachments"
                class="text-sm font-normal text-gray-500"
              >
                ({{ attachments.length }})
              </span>
            </h3>
          </div>

          <!-- Loading State -->
          <div
            v-if="loadingAttachments"
            class="flex items-center gap-2 text-gray-500 py-4"
          >
            <Loader2 class="w-5 h-5 animate-spin" />
            <span class="text-sm">Memuat lampiran...</span>
          </div>

          <!-- Attachments Grid -->
          <div
            v-else-if="attachments.length >= 0"
            class="grid grid-cols-2 gap-3 w-1/2"
          >
            <a
              v-for="att in attachments"
              :key="att.attachment.id_attachment"
              :href="att.download_url"
              target="_blank"
              rel="noopener noreferrer"
              class="group relative border-2 rounded-xl overflow-hidden transition-all duration-200 w-full"
              :class="[
                getFileColor(att.attachment.file_path).border,
                getFileColor(att.attachment.file_path).hover,
                'hover:shadow-lg hover:scale-[1.02]',
              ]"
            >
              <!-- Image Preview -->
              <div
                v-if="getFileType(att.attachment.file_path) === 'image'"
                class="aspect-video bg-gray-100 relative overflow-hidden"
              >
                <img
                  :src="att.download_url"
                  :alt="getFileName(att.attachment.file_path)"
                  class="w-full h-full object-cover group-hover:brightness-75 transition-all"
                  loading="lazy"
                />
                <div
                  class="absolute inset-0 bg-black/10 bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center"
                >
                  <Download
                    class="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="getFileColor(att.attachment.file_path).text"
                  />
                </div>
              </div>

              <!-- PDF Preview -->
              <div
                v-else-if="getFileType(att.attachment.file_path) === 'pdf'"
                class="aspect-video relative flex items-center justify-center"
                :class="getFileColor(att.attachment.file_path).bg"
              >
                <File
                  class="w-16 h-16"
                  :class="getFileColor(att.attachment.file_path).text"
                />
                <div
                  class="absolute inset-0 hover:bg-black/10 bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center"
                >
                  <Download
                    class="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="getFileColor(att.attachment.file_path).text"
                  />
                </div>
              </div>

              <!-- Other File Types -->
              <div
                v-else
                class="aspect-video relative flex items-center justify-center"
                :class="getFileColor(att.attachment.file_path).bg"
              >
                <component
                  :is="getFileIcon(att.attachment.file_path)"
                  class="w-16 h-16"
                  :class="getFileColor(att.attachment.file_path).text"
                />
                <div
                  class="absolute inset-0 hover:bg-black/20 bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center"
                >
                  <Download
                    class="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="getFileColor(att.attachment.file_path).text"
                  />
                </div>
              </div>

              <!-- File Info Footer -->
              <div
                class="p-3 bg-white border-t-2"
                :class="getFileColor(att.attachment.file_path).border"
              >
                <p
                  class="text-sm font-semibold mb-1 truncate"
                  :class="getFileColor(att.attachment.file_path).text"
                >
                  {{ getFileName(att.attachment.file_path) }}
                </p>
                <div
                  class="flex items-center justify-between text-xs text-gray-500"
                >
                  <span class="uppercase font-medium">
                    {{ getFileType(att.attachment.file_path) }}
                  </span>
                  <span>
                    {{ formatDate(att.attachment.uploaded_at) }}
                  </span>
                </div>
              </div>

              <!-- Download Badge on Hover -->
              <div
                class="absolute top-2 right-2 px-3 py-1 bg-white rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                :class="getFileColor(att.attachment.file_path).text"
              >
                View
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
