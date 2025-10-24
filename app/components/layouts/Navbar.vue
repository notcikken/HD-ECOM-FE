<script setup>
import { Mail } from 'lucide-vue-next';
</script>

<template>
  <nav
    class="w-full bg-white shadow-md px-6 py-3 flex items-center justify-between"
  >
    <div class="flex items-center space-x-2">
      <img src="" alt="Logo" class="w-6 h-6" />
      <span class="text-green-600 font-bold text-xl">Toko</span>
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
