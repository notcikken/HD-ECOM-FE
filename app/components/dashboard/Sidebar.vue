<script setup lang="ts">
import {
  LayoutDashboard,
  Users,
  Store,
  User,
  Headphones,
  MessageCircle,
} from "lucide-vue-next";
import { useRoute } from "vue-router";
import { useNotification } from "~/composables/useNotification";
import { computed } from "vue";

const route = useRoute();
const { notification } = useNotification();

// Return an array of conversations that have unread messages
const totalUnreadConversations = computed(() => {
  if (!notification.value || !Array.isArray(notification.value)) return [];
  return notification.value.filter((n) => (n.unreadCount || 0) > 0);
});

const menuItems = computed(() => [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    path: "/dashboard/customer",
    label: "Customer",
    icon: Users,
    badge: "12",
  },
  {
    path: "/dashboard/seller",
    label: "Seller",
    icon: Store,
    badge: "8",
  },
  {
    path: "/dashboard/chat",
    label: "Customer Chat",
    icon: MessageCircle,
    badge:
      totalUnreadConversations.value.length > 0
        ? String(totalUnreadConversations.value.length)
        : null,
  },
]);

const isActive = (path: string) => {
  if (path === "/dashboard") {
    return route.path === "/dashboard";
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
          <Headphones class="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-800">Desk Ticketing</h2>
          <p class="text-xs text-gray-500">Admin Panel</p>
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
            :class="
              item.path === '/dashboard/chat' &&
              totalUnreadConversations.length > 0
                ? 'bg-red-100 text-red-700'
                : ''
            "
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
