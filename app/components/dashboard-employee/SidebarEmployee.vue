<script setup lang="ts">
import {
  User,
  Ticket,
  CheckCircle,
  IdCardLanyard,
} from "lucide-vue-next";
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();


const menuItems = computed(() => [
  {
    path: "/dashboard-support/assigned-tickets",
    label: "Assigned Tickets",
    icon: Ticket,
    badge: null,
  },
  {
    path: "/dashboard-support/all-tickets",
    label: "All Tickets",
    icon: CheckCircle,
    badge: "12",
  },
]);

const isActive = (path: string) => {
  if (path === "/dashboard-support") {
    return route.path === "/dashboard-support";
  }
  return route.path.startsWith(path);
};
</script>

<template>
  <aside class="relative w-64 bg-white border-r border-gray-200 min-h-screen">
    <div class="p-6">
      <div class="flex items-center space-x-3 mb-8">
        <div
          class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center"
        >
          
          <IdCardLanyard class="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-800">Desk Ticketing</h2>
          <p class="text-xs text-gray-500">Employee Panel</p>
        </div>
      </div>

      <nav class="space-y-2">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200"
          :class="
            isActive(item.path)
              ? 'bg-green-50 text-green-700 font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          "
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
          <span
            v-if="item.badge"
            class="ml-auto bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full"
          >
            {{ item.badge }}
          </span>
        </NuxtLink>
      </nav>
    </div>

    <div class="flex absolute p-3 bottom-1">
      <div class="bg-gray-100 rounded-lg p-4">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center"
          >
            <User class="w-5 h-5 text-gray-600" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">Admin User</p>
            <p class="text-xs text-gray-500">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
