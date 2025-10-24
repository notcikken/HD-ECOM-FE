<script setup>
import { ref } from 'vue';

const query = ref('');
const isFocused = ref(false);

const suggestions = [
  'promo terkini',
  'blm terima refund',
  'snk biaya jasa aplikasi',
  'batalkan pesanan',
  'blm terima pesanan',
  'status pengiriman',
  'tagihan cc masih muncul',
];

function handleBlur() {
  setTimeout(() => (isFocused.value = false), 150);
}
</script>

<template>
  <div class="flex space-x-4 justify-between items-center">
    <div>
      <h1 class="text-5xl font-bold">
        Selamat Siang, M <br />
        Ada yang bisa kami bantu?
      </h1>
      <div class="mt-6">
        <div class="w-[600px] transition-all duration-200 ease-in-out">
          <div
            class="flex items-center bg-white rounded-lg shadow-sm px-4 py-3 border border-gray-200 hover:shadow-md focus-within:shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 text-gray-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-4.35-4.35m1.6-5.4a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              v-model="query"
              @focus="isFocused = true"
              @blur="handleBlur"
              type="text"
              placeholder="Ketik kata kunci (misal: promosi berlangsung)"
              class="w-full outline-none text-gray-700 placeholder-gray-500"
            />
          </div>
          <transition name="fade">
            <div
              v-if="isFocused"
              class="absolute mt-2 w-[600px] bg-white shadow-lg border border-gray-200 rounded-lg p-4"
            >
              <p class="text-gray-600 font-medium mb-2">Pencarian populer</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="item in suggestions"
                  :key="item"
                  class="px-3 py-1 border border-green-500 text-green-600 rounded-full text-sm hover:bg-green-50 transition"
                >
                  {{ item }}
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <div class="flex justify-center">
      <img
        src="/images/images.png"
        alt="Hero"
        class="w-full h-auto max-h-[600px]"
      />
    </div>
  </div>
</template>
