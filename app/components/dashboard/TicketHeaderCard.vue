<script setup lang="ts">
import {
  FileText,
  Image as ImageIcon,
  File,
  FileCode,
  Download,
} from "lucide-vue-next";
import type { Ticket } from "~/types/ticket";
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

defineProps<Props>();

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
        <!-- Supporting Documents (if any) -->
        <div
          v-if="
            ticket.supportingDocuments && ticket.supportingDocuments.length > 0
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
                <component :is="getFileIcon(doc)" class="w-5 h-5 text-white" />
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
              <div class="opacity-0 group-hover:opacity-100 transition-opacity">
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
  </div>
</template>
