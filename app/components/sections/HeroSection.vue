<script setup>
import { ref } from 'vue';
import { Search, X, TrendingUp, Hash } from 'lucide-vue-next';

// Reactive state
const query = ref('');
const isFocused = ref(false);

// Search suggestions data
const suggestions = [
  'promo terkini',
  'blm terima refund',
  'snk biaya jasa aplikasi',
  'batalkan pesanan',
  'blm terima pesanan',
  'status pengiriman',
  'tagihan cc masih muncul',
  'cara pembayaran',
];

// Handle blur with delay to allow for suggestion clicks
function handleBlur() {
  setTimeout(() => {
    isFocused.value = false;
  }, 150);
}
</script>

<template>
  <section
    class="relative overflow-hidden bg-linear-to-br from-[#F8D46F] via-[#F8D46F] to-[#E1AE42]"
  >
    <div
      class="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent"
    ></div>

    <div class="relative max-w-6xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
      <div
        class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
      >
        <!-- Content Section -->
        <div class="space-y-4">
          <div>
            <h1 class="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Selamat Siang,
            </h1>
            <p class="text-lg lg:text-xl text-white/90 font-medium">
              Ada yang bisa kami bantu?
            </p>
          </div>

          <!-- Compact Search Interface -->
          <div class="relative max-w-md">
            <div class="relative">
              <div
                class="absolute inset-0 bg-white rounded-xl shadow-md opacity-95"
              ></div>
              <div
                class="relative bg-white rounded-xl shadow border border-white/20 overflow-hidden"
              >
                <div class="flex items-center p-3">
                  <Search class="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                  <input
                    v-model="query"
                    @focus="isFocused = true"
                    @blur="handleBlur"
                    type="text"
                    placeholder="Ketik kata kunci (misal: promosi)"
                    class="w-full text-gray-700 placeholder-gray-500 text-sm focus:outline-none"
                    aria-label="Cari bantuan atau informasi"
                  />
                  <button
                    v-if="query"
                    @click="query = ''"
                    class="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Hapus pencarian"
                  >
                    <X class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Search Suggestions -->
            <transition name="slide-fade">
              <div
                v-if="isFocused"
                class="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 p-4 z-10"
              >
                <div class="mb-3">
                  <h3
                    class="text-sm font-semibold text-gray-700 mb-2 flex items-center"
                  >
                    Pencarian populer
                  </h3>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    v-for="item in suggestions"
                    :key="item"
                    @click="query = item"
                    class="text-left px-3 py-2 rounded-md border border-[#F79E0E]/20 text-[#F79E0E] font-medium hover:bg-[#F79E0E]/5 hover:border-[#F79E0E]/40 transition-all duration-200 text-sm group"
                  >
                    <span class="flex items-center">
                      <Hash
                        class="w-3 h-3 mr-2 opacity-60 group-hover:opacity-100"
                      />
                      {{ item }}
                    </span>
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- Illustration Section -->
        <div class="relative flex justify-center lg:justify-end">
          <div class="relative">
            <div></div>
            <img
              src="/images/header.png"
              alt="Ilustrasi bantuan pelanggan"
              class="relative w-full max-w-xs lg:max-w-sm xl:max-w-md h-auto object-contain"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Enhanced transition animations */
.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-5px);
  opacity: 0;
}
</style>
