<template>
  <div>
    <h1 class="text-center text-2xl font-bold mt-12">
      Pilih topik sesuai kendala pembelianmu
    </h1>

    <div class="grid grid-cols-4 gap-4 mt-12">
      <div
        v-for="topic in topics"
        :key="topic.id"
        class="py-4 px-4 w-full bg-white rounded-md flex items-center space-x-4 shadow-md"
      >
        <img :src="topic.icon" :alt="topic.title" class="w-12 h-12" />
        <h1>{{ topic.title }}</h1>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  initialTopics: {
    type: Array,
    default: null,
  },
});

const defaultTopics = [
  { id: 1, title: 'Akun & Keamanan', icon: '/icons/ic_akun_saya_v4.png' },
  { id: 2, title: 'Pembayaran', icon: '/icons/ic_akun_saya_v4.png' },
  { id: 3, title: 'Pengiriman', icon: '/icons/ic_akun_saya_v4.png' },
  { id: 4, title: 'Pengembalian', icon: '/icons/ic_akun_saya_v4.png' },
  { id: 5, title: 'Promo & Voucher', icon: '/icons/ic_akun_saya_v4.png' },
  { id: 6, title: 'Teknis Aplikasi', icon: '/icons/ic_akun_saya_v4.png' },
  { id: 7, title: 'Produk', icon: '/icons/ic_akun_saya_v4.png' },
  { id: 8, title: 'Lainnya', icon: '/icons/ic_akun_saya_v4.png' },
];

const topics = ref(props.initialTopics || defaultTopics);
</script>
