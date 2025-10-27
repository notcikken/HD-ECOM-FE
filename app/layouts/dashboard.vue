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

<script setup lang="ts">
import Sidebar from "~/components/dashboard/Sidebar.vue";
</script>
