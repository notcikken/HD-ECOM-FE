<script setup lang="ts">
import { Ticket, CheckCircle, IdCardLanyard, LogOut } from "lucide-vue-next"; // Add LogOut
import { useRoute } from "vue-router";
import { computed, ref, onMounted } from "vue";
import { useAuth } from "~/composables/useAuth";

const route = useRoute();
const { user, logout, fetchUserInfo } = useAuth(); // Add logout to destructured values

const ticketCounts = ref({
  in_progress: 0,
  total: 0,
});

const fetchTicketCounts = async () => {
  try {
    const config = useRuntimeConfig();
    const { token } = useAuth();

    const response = await $fetch<{
      status: number;
      message: string;
      data: {
        in_progress: number;
        total: number;
      };
    }>(`${config.public.apiBase}/api/ticket-assignments/my-counts`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      ticketCounts.value = response.data;
    }
  } catch (error) {
    console.error("Failed to fetch ticket counts:", error);
  }
};

const menuItems = computed(() => [
  {
    path: "/dashboard-support/assigned-tickets",
    label: "Assigned",
    icon: Ticket,
    badge:
      ticketCounts.value.in_progress > 0
        ? ticketCounts.value.in_progress.toString()
        : null,
  },
  {
    path: "/dashboard-support/all-tickets",
    label: "All Tickets",
    icon: CheckCircle,
    badge: null,
  },
]);

const isActive = (path: string) => {
  if (path === "/dashboard-support") {
    return route.path === "/dashboard-support";
  }
  return route.path.startsWith(path);
};

onMounted(() => {
  fetchTicketCounts();
});

const handleLogout = () => {
  logout();
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

    <div class="flex absolute p-3 bottom-1 w-full flex-col gap-3">
      <!-- User Info -->
      <div
        class="bg-gray-100 rounded-lg p-4 hover:bg-gray-200 w-full cursor-pointer"
        @click="handleLogout"
      >
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center"
          >
            <LogOut class="w-5 h-5 text-gray-600 rotate-180" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">
              {{ user.username || "Support" }}
            </p>
            <p class="text-xs text-gray-500">
              {{ user.email || "support@example.com" }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
