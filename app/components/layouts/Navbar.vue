<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Mail } from 'lucide-vue-next';

// Track whether the page has been scrolled a small amount.
const isScrolled = ref(false);
const onScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

onMounted(() => {
  // initialize and attach listener only on client
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>

<template>
  <nav
    :class="[
      'w-full bg-[#F8D46F] px-6 py-3 flex items-center justify-between transition-shadow duration-200',
      { 'shadow-md': isScrolled }
    ]"
  >
    <div class="flex items-center space-x-2">
      
      <div>
        <h1 class="text-lg font-semibold ">SecondCycle <span class="opacity-50 text-sm"> | Help Center</span></h1>
      </div>
    </div>
    <div class="flex items-center space-x-8">
      <div
        class="px-4 py-2 hover:bg-gray-100 flex items-center space-x-4 rounded-md"
      >
        <Mail class="w-6 h-6" />
        <button>Pesan Bantuan</button>
      </div>
      <div
        class="w-8 h-8 flex items-center justify-center bg-black text-white font-semibold rounded-full"
      >
        M
      </div>
    </div>
  </nav>
</template>
