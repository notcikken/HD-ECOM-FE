<script setup lang="ts">
import SidebarEmployee from "~/components/dashboard-employee/SidebarEmployee.vue";
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <SidebarEmployee />
    <main class="flex-1 overflow-y-auto">
      <div class="p-8">
        <NuxtPage />
      </div>
    </main>
  </div>
</template>
