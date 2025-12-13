<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { Mail, Store, User, LogOut } from "lucide-vue-next";
import { useAuth } from "~/composables/useAuth";

const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

const { user, logout: authLogout, fetchUserInfo } = useAuth();

const isAdmin = computed(
  () => user.value?.role === 0 || user.value?.role === "0" || user.value?.role === "admin"
);

const userInitial = computed(() => {
  if (!user.value?.username) return "TEST";
  return user.value.username.charAt(0).toUpperCase();
});

const logout = () => {
  authLogout();
};

onMounted(async () => {
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
  
  // Fetch user info when component mounts if authenticated
  if (user.value) {
    await fetchUserInfo();
  }
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <nav
    :class=" [
      'w-full bg-[#F8D46F] border-b border-orange-200/30 transition-all duration-300',
      { 'shadow-lg backdrop-blur-sm': isScrolled },
    ]"
  >
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Brand section -->
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-[#F79E0E] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
          >
            <Store class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-800">
              SecondCycle
              <span class="text-sm font-normal text-gray-600 ml-1"
                >| Help Center</span
              >
            </h1>
          </div>
        </div>

        <!-- Actions section -->
        <div class="flex items-center space-x-4">
          <RouterLink to="/contact-support"
            ><button
              class="inline-flex items-center lg:space-x-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200/50 focus:ring-2 focus:ring-[#F79E0E]/20 focus:outline-none"
              aria-label="Kirim pesan bantuan"
            >
              <Mail class="w-4 h-4" />
              <span class="hidden lg:inline">Pesan Bantuan</span>
            </button>
          </RouterLink>

          <!-- User Menu -->
          <div v-if="user" class="flex items-center space-x-2">
            <!-- Admin Badge -->
            <span
              v-if="isAdmin"
              class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"
            >
              Admin
            </span>

            <!-- Dashboard Link for Admin -->
            <NuxtLink
              v-if="isAdmin"
              to="/dashboard"
              class="p-2 hover:bg-white/50 rounded-lg transition-colors"
              title="Dashboard"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </NuxtLink>

            <!-- Logout Button -->
            <button
              class="p-2 hover:bg-white/50 rounded-lg transition-colors"
              title="Logout"
              @click="logout"  
            >
              <LogOut class="w-4 h-4" />
            </button>

            <!-- Profile Avatar with Initial -->
            <div
              class="w-9 h-9 bg-gray-800 hover:bg-gray-700 cursor-pointer text-white font-semibold rounded-full transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#F79E0E]/20 focus:outline-none"
              :title="`${user.username || user.email || 'User'}`"
            >
              <span class="text-sm">{{ userInitial }}</span>
            </div>
          </div>

          <!-- Login Link if not authenticated -->
          <NuxtLink v-else to="/login">
            <button
              class="w-9 h-9 bg-white hover:bg-gray-700 cursor-pointer text-gray-700 font-semibold rounded-full transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#F79E0E]/20 focus:outline-none"
              aria-label="Menu profil pengguna"
            >
              <User class="w-4 h-4" />
            </button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>
