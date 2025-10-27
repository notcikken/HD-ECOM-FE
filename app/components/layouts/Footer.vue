<template>
  <footer class="bg-[#F8D46F] border-t border-orange-200/30">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <!-- Main footer content -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <!-- Brand section -->
        <div class="lg:col-span-5">
          <div class="flex items-center space-x-3 mb-6">
            <div
              class="w-12 h-12 bg-[#F79E0E] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
            >
              <Store class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-800">Marketplace Help</h3>
              <p class="text-sm text-gray-600">
                Pusat bantuan & panduan pembeli
              </p>
            </div>
          </div>
          <p class="text-gray-600 leading-relaxed max-w-md mb-8">
            Butuh bantuan lebih lanjut? Hubungi tim kami atau lihat dokumentasi
            untuk penyelesaian cepat masalah Anda.
          </p>

          <!-- Social Media Links -->
          <div class="flex items-center space-x-4">
            <span class="text-sm font-medium text-gray-700">Ikuti kami:</span>
            <div class="flex space-x-3">
              <a
                href="#"
                aria-label="Twitter"
                class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Twitter class="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Facebook class="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-pink-500 hover:bg-pink-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Instagram class="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <!-- Products -->
          <div>
            <h4
              class="text-sm font-semibold text-gray-800 mb-4 flex items-center"
            >
              <ShoppingBag class="w-4 h-4 mr-2 text-[#F79E0E]" />
              Produk
            </h4>
            <nav>
              <ul class="space-y-3">
                <li>
                  <a
                    href="#"
                    class="text-gray-600 hover:text-[#F79E0E] transition-colors duration-200 flex items-center group"
                  >
                    <ChevronRight
                      class="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    Cara Pembelian
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    class="text-gray-600 hover:text-[#F79E0E] transition-colors duration-200 flex items-center group"
                  >
                    <ChevronRight
                      class="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    Pengembalian
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    class="text-gray-600 hover:text-[#F79E0E] transition-colors duration-200 flex items-center group"
                  >
                    <ChevronRight
                      class="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    Pembayaran
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <!-- Support -->
          <div>
            <h4
              class="text-sm font-semibold text-gray-800 mb-4 flex items-center"
            >
              <HelpCircle class="w-4 h-4 mr-2 text-[#F79E0E]" />
              Bantuan
            </h4>
            <nav>
              <ul class="space-y-3">
                <li>
                  <a
                    href="#"
                    class="text-gray-600 hover:text-[#F79E0E] transition-colors duration-200 flex items-center group"
                  >
                    <ChevronRight
                      class="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    class="text-gray-600 hover:text-[#F79E0E] transition-colors duration-200 flex items-center group"
                  >
                    <ChevronRight
                      class="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    Kontak Kami
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    class="text-gray-600 hover:text-[#F79E0E] transition-colors duration-200 flex items-center group"
                  >
                    <ChevronRight
                      class="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    Kebijakan
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <!-- Newsletter -->
        <div class="lg:col-span-3">
          <h4
            class="text-sm font-semibold text-gray-800 mb-4 flex items-center"
          >
            <Mail class="w-4 h-4 mr-2 text-[#F79E0E]" />
            Newsletter
          </h4>
          <p class="text-gray-600 mb-6 text-sm leading-relaxed">
            Dapatkan update promo terbaru dan panduan belanja langsung ke email
            Anda.
          </p>

          <form class="space-y-3" @submit.prevent>
            <div class="relative">
              <Mail
                class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                placeholder="Masukkan email Anda"
                class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-[#F79E0E]/20 focus:border-[#F79E0E] transition-all duration-200 shadow-sm"
                required
              />
            </div>
            <button
              type="submit"
              class="w-full bg-[#F79E0E] text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 focus:ring-2 focus:ring-[#F79E0E]/20 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <Send class="w-4 h-4" />
              <span>Berlangganan</span>
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Bottom section -->
    <div class="border-t border-orange-200/40 bg-[#F8D46F]/50">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div
          class="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
        >
          <!-- Copyright -->
          <div class="flex items-center text-sm text-gray-600">
            <Copyright class="w-4 h-4 mr-2" />
            <span class="font-semibold text-gray-800">Marketplace</span>
            <span class="mx-2">•</span>
            <span>Semua hak dilindungi</span>
          </div>

          <!-- Legal Links -->
          <nav class="flex items-center space-x-6 text-sm">
            <a
              href="#"
              class="text-gray-600 hover:text-[#F79E0E] transition-colors duration-200 flex items-center"
            >
              <FileText class="w-4 h-4 mr-1" />
              Syarat & Ketentuan
            </a>
            <a
              href="#"
              class="text-gray-600 hover:text-[#F79E0E] transition-colors duration-200 flex items-center"
            >
              <Shield class="w-4 h-4 mr-1" />
              Kebijakan Privasi
            </a>
          </nav>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Import Lucide Vue icons for modern, consistent iconography
import {
  Store,
  Mail,
  Send,
  Copyright,
  FileText,
  Shield,
  Twitter,
  Facebook,
  Instagram,
  ShoppingBag,
  HelpCircle,
  ChevronRight,
} from 'lucide-vue-next';
</script>

<style scoped>
/* Minimal scoped styles for enhanced interactions */
.group:hover .opacity-0 {
  opacity: 1;
}
</style>
