<template>
  <div
    v-if="showDebug"
    class="fixed bottom-24 right-6 w-[500px] max-h-[600px] bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden z-50 border border-gray-700"
  >
    <!-- Header -->
    <div
      class="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700"
    >
      <div class="flex items-center space-x-2">
        <Terminal class="w-5 h-5 text-green-400" />
        <h3 class="font-semibold text-sm">WebSocket Debug Panel</h3>
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="$emit('clear-logs')"
          class="p-1.5 hover:bg-gray-700 rounded transition-colors"
          title="Clear logs"
        >
          <Trash2 class="w-4 h-4" />
        </button>
        <button
          @click="$emit('export-logs')"
          class="p-1.5 hover:bg-gray-700 rounded transition-colors"
          title="Export logs"
        >
          <Download class="w-4 h-4" />
        </button>
        <button
          @click="$emit('close')"
          class="p-1.5 hover:bg-gray-700 rounded transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Connection Status -->
    <div class="bg-gray-850 px-4 py-2 border-b border-gray-700">
      <div class="flex items-center justify-between text-xs">
        <div class="flex items-center space-x-2">
          <span
            :class="[
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-green-500' : 'bg-red-500',
            ]"
          ></span>
          <span class="text-gray-300">{{
            isConnected ? "Connected" : "Disconnected"
          }}</span>
        </div>
        <div class="flex items-center space-x-4">
          <span
            :class="[
              'font-mono',
              isAuthenticated ? 'text-green-400' : 'text-red-400',
            ]"
          >
            Auth: {{ isAuthenticated ? "✓" : "✗" }}
          </span>
          <span class="text-gray-400">Logs: {{ logs.length }}</span>
        </div>
      </div>
    </div>

    <!-- Logs -->
    <div
      ref="logsContainer"
      class="overflow-y-auto max-h-[450px] p-3 space-y-2 font-mono text-xs"
    >
      <div
        v-for="(log, index) in logs"
        :key="index"
        :class="['p-2 rounded border-l-4', getLogClass(log.type)]"
      >
        <div class="flex items-start justify-between mb-1">
          <span
            :class="getLogTypeClass(log.type)"
            class="font-semibold uppercase text-xs"
          >
            {{ log.type }}
          </span>
          <span class="text-gray-500 text-xs">{{
            formatTime(log.timestamp)
          }}</span>
        </div>
        <div class="text-gray-300 mb-1">{{ log.message }}</div>
        <div
          v-if="log.data"
          class="bg-gray-950 p-2 rounded mt-1 overflow-x-auto"
        >
          <pre class="text-xs text-gray-400">{{ formatData(log.data) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { Terminal, X, Trash2, Download } from "lucide-vue-next";

interface DebugLog {
  timestamp: string;
  type: "info" | "error" | "warning" | "success";
  message: string;
  data?: any;
}

// Define props
const props = defineProps<{
  showDebug: boolean;
  logs: DebugLog[];
  isConnected: boolean;
  isAuthenticated: boolean;
}>();

// Define emits
defineEmits<{
  (e: "close"): void;
  (e: "clear-logs"): void;
  (e: "export-logs"): void;
}>();

const logsContainer = ref<HTMLElement | null>(null);

const getLogClass = (type: string) => {
  const classes = {
    info: "bg-gray-800 border-blue-500",
    error: "bg-red-950/30 border-red-500",
    warning: "bg-yellow-950/30 border-yellow-500",
    success: "bg-green-950/30 border-green-500",
  };
  return classes[type as keyof typeof classes] || classes.info;
};

const getLogTypeClass = (type: string) => {
  const classes = {
    info: "text-blue-400",
    error: "text-red-400",
    warning: "text-yellow-400",
    success: "text-green-400",
  };
  return classes[type as keyof typeof classes] || classes.info;
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
};

const formatData = (data: any) => {
  return JSON.stringify(data, null, 2);
};

// Auto-scroll to bottom when new logs arrive
watch(
  () => props.logs.length,
  () => {
    nextTick(() => {
      if (logsContainer.value) {
        logsContainer.value.scrollTop = logsContainer.value.scrollHeight;
      }
    });
  }
);
</script>
