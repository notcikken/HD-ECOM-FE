<template>
  <div>
    <h1 class="text-center text-2xl font-bold mt-12 text-[#F79E0E]">
      Pilih topik sesuai kendala pembelianmu
    </h1>

    <div class="grid grid-cols-4 gap-4 mt-12">
      <div
        v-for="topic in topics"
        :key="topic.id"
        class="py-4 px-4 w-full bg-[#FFF1C1] rounded-md flex items-center space-x-4 cursor-pointer hover:shadow-md hover:scale-105 transition"
      >
        <div
          class="w-12 h-12 bg-[#F79E0E] rounded-full flex items-center justify-center"
        >
          <component :is="topic.icon" class="w-6 h-6 text-white" />
        </div>
        <h1>{{ topic.title }}</h1>
      </div>
    </div>
  </div>
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
} from 'lucide-vue-next';

const props = defineProps({
  initialTopics: {
    type: Array,
    default: null,
  },
});

const defaultTopics = [
  { id: 1, title: 'Akun & Keamanan', icon: Shield },
  { id: 2, title: 'Pembayaran', icon: CreditCard },
  { id: 3, title: 'Pengiriman', icon: Truck },
  { id: 4, title: 'Pengembalian', icon: RotateCcw },
  { id: 5, title: 'Promo & Voucher', icon: Tag },
  { id: 6, title: 'Teknis Aplikasi', icon: Smartphone },
  { id: 7, title: 'Produk', icon: Package },
  { id: 8, title: 'Lainnya', icon: MoreHorizontal },
];

const topics = ref(props.initialTopics || defaultTopics);
</script>
