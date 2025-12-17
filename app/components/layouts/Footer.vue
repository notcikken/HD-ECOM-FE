<script setup>
// Import Lucide Vue icons for modern, consistent iconography
import {
  Headphones,
  Copyright,
  FileText,
  Shield,
  MessageCircle,
  HelpCircle,
} from "lucide-vue-next";
</script>

<template>
  <footer class="bg-[#F8D46F] border-t border-orange-200/30">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <!-- Main footer content -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <!-- Brand section -->
        <div class="lg:col-span-8">
          <div class="flex items-center space-x-3 mb-6">
            <div
              class="w-10 h-10 bg-[#F79E0E] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
            >
              <Headphones class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-md font-bold text-gray-800">
                SecondCycle Help Desk
              </h3>
              <p class="text-xs text-gray-600">
                Pusat bantuan & ticketing system
              </p>
            </div>
          </div>
          <p class="text-gray-600 leading-relaxed max-w-md mb-8 text-sm">
            Sistem ticketing terintegrasi untuk mengelola permintaan bantuan
            customer dan seller dengan efisien. Tim support kami siap membantu
            Anda 24/7.
          </p>
        </div>

        <!-- Navigation Links -->
        <div class="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <!-- Features -->
          <div>
            <h4
              class="text-sm font-semibold text-gray-800 mb-4 flex items-center"
            >
              <MessageCircle class="w-4 h-4 mr-2 text-[#F79E0E]" />
              Fitur
            </h4>
            <nav>
              <ul class="space-y-3">
                <li>
                  <NuxtLink
                    to="/contact-support"
                    class="text-gray-600 hover:text-[#F79E0E] transition-colors duration-200 text-sm"
                  >
                    Buat Tiket
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink
                    to="/topics"
                    class="text-gray-600 hover:text-[#F79E0E] transition-colors duration-200 text-sm"
                  >
                    Topik Bantuan
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink
                    to="/"
                    class="text-gray-600 hover:text-[#F79E0E] transition-colors duration-200 text-sm"
                  >
                    FAQ
                  </NuxtLink>
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
                    href="mailto:support@secondcycle.com"
                    class="text-gray-600 hover:text-[#F79E0E] transition-colors duration-200 text-sm"
                  >
                    Email Support
                  </a>
                </li>
                <li>
                  <NuxtLink
                    to="/contact-support"
                    class="text-gray-600 hover:text-[#F79E0E] transition-colors duration-200 text-sm"
                  >
                    Hubungi Kami
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink
                    to="/"
                    class="text-gray-600 hover:text-[#F79E0E] transition-colors duration-200 text-sm"
                  >
                    Panduan
                  </NuxtLink>
                </li>
              </ul>
            </nav>
          </div>
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
            <span class="font-semibold text-gray-800"
              >SecondCycle Help Desk</span
            >
            <span class="mx-2">•</span>
            <span>{{ new Date().getFullYear() }} - Semua hak dilindungi</span>
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

<style scoped>
/* Minimal scoped styles for enhanced interactions */
.group:hover .opacity-0 {
  opacity: 1;
}
</style>
