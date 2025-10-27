<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Mail, Store, User } from 'lucide-vue-next';

// Track scroll state for enhanced navbar styling
const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

onMounted(() => {
  // Initialize scroll state and attach listener
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <nav
    :class="[
      'w-full bg-[#F8D46F] border-b border-orange-200/30 transition-all duration-300',
      { 'shadow-lg backdrop-blur-sm': isScrolled },
    ]"
  >
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Brand section -->
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-[#F79E0E] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
          >
            <Store class="w-5 h-5" />
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
          <button
            class="inline-flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200/50 focus:ring-2 focus:ring-[#F79E0E]/20 focus:outline-none"
            aria-label="Kirim pesan bantuan"
          >
            <Mail class="w-4 h-4" />
            <span>Pesan Bantuan</span>
          </button>

          <div class="relative">
            <button
              class="w-9 h-9 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-full transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#F79E0E]/20 focus:outline-none"
              aria-label="Menu profil pengguna"
            >
              <User class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
