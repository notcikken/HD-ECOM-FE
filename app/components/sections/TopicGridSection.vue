<template>
  <section class="py-16">
    <div class="text-center mb-12">
      <h2 class="text-3xl lg:text-4xl font-bold text-[#F79E0E] mb-4">
        Pilih topik sesuai kendala pembelianmu
      </h2>
      <p class="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
        Temukan bantuan yang tepat untuk masalah berbelanja Anda dengan memilih
        kategori yang sesuai
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      <div
        v-for="topic in topics"
        :key="topic.id"
        class="group relative bg-[#FFF1C1] hover:bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-orange-100/50 hover:-translate-y-1 border border-orange-100/50 hover:border-[#F79E0E]/20"
        role="button"
        :aria-label="`Lihat bantuan untuk ${topic.title}`"
        tabindex="0"
        @keydown.enter="$emit('topic-selected', topic)"
        @keydown.space.prevent="$emit('topic-selected', topic)"
        @click="$emit('topic-selected', topic)"
      >
        <!-- Background decoration -->
        <div
          class="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-[#F79E0E]/5 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        ></div>

        <div class="relative flex items-center space-x-4">
          <!-- Icon container with enhanced styling -->
          <div class="relative">
            <div
              class="w-14 h-14 bg-[#F79E0E] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300"
            >
              <component :is="topic.icon" class="w-7 h-7 text-white" />
            </div>
            <!-- Icon glow effect -->
            <div
              class="absolute inset-0 w-14 h-14 bg-[#F79E0E] rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"
            ></div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h3
              class="font-semibold text-gray-800 text-lg group-hover:text-[#F79E0E] transition-colors duration-200 leading-tight"
            >
              {{ topic.title }}
            </h3>
            <p
              class="text-sm text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-200"
            >
              {{ topic.description || 'Lihat panduan lengkap' }}
            </p>
          </div>

          <!-- Arrow indicator -->
          <div
            class="opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-0 group-hover:translate-x-1"
          >
            <ChevronRight class="w-5 h-5 text-[#F79E0E]" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import {
  Shield,
  CreditCard,
  Truck,
  RotateCcw,
  Tag,
  Smartphone,
  Package,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-vue-next';

// Props definition
const props = defineProps({
  initialTopics: {
    type: Array,
    default: null,
  },
});

// Enhanced topic data with descriptions
const defaultTopics = [
  {
    id: 1,
    title: 'Akun & Keamanan',
    icon: Shield,
    description: 'Kelola akun dan keamanan',
  },
  {
    id: 2,
    title: 'Pembayaran',
    icon: CreditCard,
    description: 'Metode dan proses pembayaran',
  },
  {
    id: 3,
    title: 'Pengiriman',
    icon: Truck,
    description: 'Lacak dan kelola pengiriman',
  },
  {
    id: 4,
    title: 'Pengembalian',
    icon: RotateCcw,
    description: 'Proses refund dan retur',
  },
  {
    id: 5,
    title: 'Promo & Voucher',
    icon: Tag,
    description: 'Dapatkan penawaran terbaik',
  },
  {
    id: 6,
    title: 'Teknis Aplikasi',
    icon: Smartphone,
    description: 'Bantuan teknis aplikasi',
  },
  {
    id: 7,
    title: 'Produk',
    icon: Package,
    description: 'Informasi produk dan katalog',
  },
  {
    id: 8,
    title: 'Lainnya',
    icon: MoreHorizontal,
    description: 'Bantuan umum lainnya',
  },
];

// Reactive topics data
const topics = ref(props.initialTopics || defaultTopics);

// Emit definition for parent component communication
defineEmits(['topic-selected']);
</script>

<style scoped>
/* Focus styles for accessibility */
.group:focus {
  outline: 2px solid #f79e0e;
  outline-offset: 2px;
}

/* Enhanced hover animations */
.group:hover .transform {
  transform: translateX(4px);
}
</style>
