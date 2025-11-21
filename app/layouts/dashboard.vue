<script setup lang="ts">
import Sidebar from "~/components/dashboard/Sidebar.vue";
import { onMounted, onUnmounted } from "vue";
import { getWebsocket } from "~/composables/useWebsocket";
import { useNotification } from "~/composables/useNotification";

const config = useRuntimeConfig();
const wsUrl = `${config.public.wsBase}/api/ws`;

const { fetchNotification, notification } = useNotification();
const ws = getWebsocket(wsUrl);

onMounted(() => {
  // connect early so pages/components can reuse the same socket
  ws.connect();
  fetchNotification();
  console.log("Notification", notification.value);
});

onUnmounted(() => {
  // disconnect when leaving dashboard layout
  ws.disconnect();
});
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <Sidebar />
    <main class="flex-1 overflow-y-auto">
      <div class="p-8">
        <NuxtPage />
      </div>
    </main>
  </div>
</template>
