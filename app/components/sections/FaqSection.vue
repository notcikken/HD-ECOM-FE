<template>
  <section class="max-w-4xl mx-auto py-16">
    <div class="text-center mb-12">
      <h2 class="text-3xl lg:text-4xl font-bold text-[#F79E0E] mb-4">
        Yang sering ditanyakan
      </h2>
      <p class="text-gray-600 text-lg leading-relaxed">
        Temukan jawaban cepat untuk pertanyaan yang paling sering diajukan
      </p>
    </div>

    <div
      class="bg-[#FFF1C1] rounded-2xl shadow-sm border border-orange-100/50 overflow-hidden"
    >
      <div
        v-for="(faq, index) in faqs"
        :key="index"
        class="border-b border-orange-100/50 last:border-b-0"
      >
        <button
          :id="`faq-button-${index}`"
          :aria-expanded="openIndex === index"
          :aria-controls="`faq-content-${index}`"
          @click="toggle(index)"
          class="w-full px-6 lg:px-8 py-6 text-left hover:bg-orange-50/50 focus:bg-orange-50/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#F79E0E]/20 focus:ring-inset"
        >
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-800 text-lg leading-tight pr-4">
              {{ faq.question }}
            </h3>
            <div class="flex items-center space-x-2 shrink-0">
              <span
                v-if="faq.link"
                class="text-xs px-2 py-1 bg-[#F79E0E]/10 text-[#F79E0E] rounded-full font-medium"
              >
                Detail
              </span>
              <ChevronDown
                :class="[
                  'w-5 h-5 text-gray-500 transition-transform duration-300',
                  { 'rotate-180': openIndex === index },
                ]"
              />
            </div>
          </div>
        </button>

        <!-- FAQ Content -->
        <div
          :id="`faq-content-${index}`"
          :aria-labelledby="`faq-button-${index}`"
          role="region"
          class="overflow-hidden"
        >
          <transition name="faq-slide">
            <div v-if="openIndex === index" class="px-6 lg:px-8 pb-6">
              <div
                class="bg-white/60 rounded-xl p-6 border border-orange-100/30"
              >
                <p class="text-gray-700 leading-relaxed mb-4">
                  {{ faq.answer }}
                </p>
                <div v-if="faq.link" class="flex items-center">
                  <a
                    :href="faq.link"
                    class="inline-flex items-center space-x-2 text-[#F79E0E] font-semibold hover:text-orange-600 transition-colors duration-200 group"
                  >
                    <span>Baca selengkapnya</span>
                    <ArrowRight
                      class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                    />
                  </a>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { ChevronDown, ArrowRight } from 'lucide-vue-next';

// Reactive state for accordion
const openIndex = ref(null);

// Toggle function with improved logic
const toggle = (index) => {
  openIndex.value = openIndex.value === index ? null : index;
};

// Enhanced FAQ data with better structure
const faqs = [
  {
    question: 'Pengembalian Dana (Refund) Belum Diterima',
    answer:
      'Pengembalian dana akan diproses dalam waktu 3-14 hari kerja tergantung metode pembayaran yang digunakan. Untuk kartu kredit biasanya 3-5 hari kerja, sedangkan transfer bank 1-3 hari kerja.',
    link: '#refund-guide',
  },
  {
    question: 'Cara Membatalkan Pesanan di Marketplace',
    answer:
      'Pembatalan pesanan dapat dilakukan secara instan jika belum diproses penjual, atau memerlukan persetujuan penjual jika sudah dalam tahap pemrosesan. Anda dapat membatalkan melalui halaman pesanan saya.',
    link: '#cancel-order',
  },
  {
    question: 'Saya Belum Terima Pesanan',
    answer:
      'Periksa status pesanan Anda di halaman riwayat transaksi. Jika sudah melewati estimasi waktu pengiriman, hubungi penjual atau layanan pelanggan untuk penyelesaian lebih lanjut.',
    link: '#track-order',
  },
  {
    question: 'GoPay Later by PT Multifinance Anak Bangsa',
    answer:
      'GoPay Later adalah layanan kredit digital yang memungkinkan Anda berbelanja sekarang dan bayar nanti dengan tenor pembayaran yang fleksibel hingga 12 bulan.',
    link: '#gopay-later',
  },
  {
    question: 'Informasi Penonaktifan Produk Investasi',
    answer:
      'Layanan investasi emas dan reksa dana sementara dinonaktifkan untuk peningkatan sistem dan keamanan. Informasi lebih lanjut akan diumumkan melalui aplikasi dan email.',
    link: '#investment-info',
  },
];
</script>

<style scoped>
/* Enhanced FAQ accordion animations */
.faq-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.faq-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.faq-slide-enter-from {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px);
}

.faq-slide-enter-to {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}

.faq-slide-leave-from {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}

.faq-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
}

/* Smooth focus transitions */
button:focus {
  transition: all 0.2s ease;
}
</style>
