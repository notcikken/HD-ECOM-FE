<template>
  <section class="max-w-2xl mx-auto py-12">
    <h2 class="text-center text-2xl font-bold mb-10">Yang sering ditanyakan</h2>
    <div class="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
      <div
        v-for="(faq, i) in faqs"
        :key="i"
        class="px-6 py-4 cursor-pointer transition-colors"
      >
        <button
          @click="toggle(i)"
          :aria-expanded="openIndex === i"
          class="flex justify-between w-full text-left font-medium text-gray-800 focus:outline-none"
        >
          {{ faq.question }}
          <span
            class="transform transition-transform duration-300"
            :class="openIndex === i ? 'rotate-180' : ''"
          >
            <ChevronDown />
          </span>
        </button>

        <transition name="faq-slide">
          <div
            v-if="openIndex === i"
            class="faq-content mt-2 text-gray-600 leading-relaxed"
          >
            {{ faq.answer }}
            <div v-if="faq.link" class="mt-1">
              <a
                :href="faq.link"
                class="text-green-600 font-semibold hover:underline"
                >Selengkapnya</a
              >
            </div>
          </div>
        </transition>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ChevronDown } from 'lucide-vue-next';
import { ref } from 'vue';

const openIndex = ref(null);

const toggle = (index) => {
  openIndex.value = openIndex.value === index ? null : index;
};

const faqs = [
  {
    question: 'Pengembalian Dana (Refund) Belum Diterima',
    answer:
      'Pengembalian dana akan diproses dalam waktu tertentu tergantung metode pembayaran yang digunakan.',
    link: '#',
  },
  {
    question: 'Cara Membatalkan Pesanan di Tokopedia',
    answer:
      'Ajukan pembatalan bisa secara instan dan butuh persetujuan penjual. Simak panduannya di sini.',
    link: '#',
  },
  {
    question: 'Saya Belum Terima Pesanan',
    answer:
      'Periksa status pesananmu di halaman transaksi dan hubungi penjual jika lewat dari estimasi waktu pengiriman.',
    link: '#',
  },
  {
    question: 'GoPay Later by PT Multifinance Anak Bangsa',
    answer:
      'GoPay Later adalah layanan kredit digital untuk transaksi di Tokopedia.',
    link: '#',
  },
  {
    question:
      'Informasi Penonaktifan Produk Tokopedia Emas dan Reksa Dana di Tokopedia',
    answer:
      'Tokopedia menghentikan sementara layanan investasi emas dan reksa dana untuk peningkatan sistem.',
    link: '#',
  },
];
</script>

<style scoped>
/* Smooth slide + fade using max-height and opacity.
     max-height uses a large value to accommodate content; overflow hidden prevents jumpiness. */

.faq-content {
  overflow: hidden;
}

/* Enter */
.faq-slide-enter-from {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
}
.faq-slide-enter-active {
  transition: max-height 320ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 240ms ease, transform 240ms ease;
}
.faq-slide-enter-to {
  max-height: 1000px; /* large enough for content */
  opacity: 1;
  transform: translateY(0);
}

/* Leave */
.faq-slide-leave-from {
  max-height: 1000px;
  opacity: 1;
  transform: translateY(0);
}
.faq-slide-leave-active {
  transition: max-height 280ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 200ms ease, transform 200ms ease;
}
.faq-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
}
</style>
