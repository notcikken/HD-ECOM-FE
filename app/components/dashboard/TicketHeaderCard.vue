<script setup lang="ts">
import {
  FileText,
  Image as ImageIcon,
  File,
  FileCode,
  Download,
} from "lucide-vue-next";
import type { Ticket } from "~/types/ticket";

interface Props {
  ticket: Ticket;
}

defineProps<Props>();

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
