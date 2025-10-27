<template>
  <footer class="bg-[#F8D46F] ">
    <div class="max-w-[1728px] mx-auto px-8 py-12 flex flex-col md:flex-row md:justify-between gap-8">
      <div class="flex-1">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-green-600 rounded-md flex items-center justify-center text-white font-bold">M</div>
          <div>
            <h3 class="text-lg font-semibold text-gray-800">Marketplace Help</h3>
            <p class="text-sm text-gray-600">Pusat bantuan & panduan pembeli</p>
          </div>
        </div>
        <p class="mt-6 text-sm text-gray-600 max-w-md">
          Butuh bantuan lebih lanjut? Hubungi tim kami atau lihat dokumentasi untuk penyelesaian cepat.
        </p>
      </div>

      <div class="flex-1 flex flex-col sm:flex-row gap-8">
        <div class="min-w-[140px]">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">Produk</h4>
          <ul class="space-y-2 text-sm text-gray-600">
            <li><a href="#" class="hover:text-green-600">Cara Pembelian</a></li>
            <li><a href="#" class="hover:text-green-600">Pengembalian</a></li>
            <li><a href="#" class="hover:text-green-600">Pembayaran</a></li>
          </ul>
        </div>

        <div class="min-w-40">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">Bantuan</h4>
          <ul class="space-y-2 text-sm text-gray-600">
            <li><a href="#" class="hover:text-green-600">FAQ</a></li>
            <li><a href="#" class="hover:text-green-600">Kontak Kami</a></li>
            <li><a href="#" class="hover:text-green-600">Kebijakan</a></li>
          </ul>
        </div>

        <div class="min-w-[220px]">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">Newsletter</h4>
          <p class="text-sm text-gray-600 mb-3">Dapatkan update promo dan panduan lewat email.</p>
          <form class="flex items-center gap-2">
            <input
              type="email"
              placeholder="Email kamu"
              class="flex-1 px-3 py-2 rounded-md outline-none text-sm focus:ring-1 focus:ring-green-200"
            />
            <button class="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition">Daftar</button>
          </form>
        </div>
      </div>
    </div>

    <div class=" bg-transparent">
      <div class="max-w-[1728px] mx-auto px-8 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
        <div>© <span class="font-semibold text-gray-800">Marketplace</span> — Semua hak dilindungi</div>
        <div class="flex items-center space-x-4 mt-3 md:mt-0">
          <a href="#" class="text-gray-600 hover:text-green-600">Syarat</a>
          <a href="#" class="text-gray-600 hover:text-green-600">Kebijakan Privasi</a>
          <div class="flex items-center space-x-2">
            <!-- simple social icons -->
            <a href="#" aria-label="twitter" class="text-gray-600 hover:text-green-600">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 7.5c.01.14.01.28.01.42 0 4.28-3.26 9.21-9.21 9.21-1.83 0-3.53-.54-4.96-1.47.26.03.52.04.79.04 1.52 0 2.92-.52 4.04-1.39-1.42-.03-2.62-.96-3.03-2.24.2.04.41.06.62.06.3 0 .59-.04.86-.11-1.49-.3-2.6-1.62-2.6-3.21v-.04c.44.25.95.4 1.49.42-1.01-.68-1.67-1.84-1.67-3.16 0-.7.19-1.36.52-1.93 1.86 2.28 4.65 3.78 7.79 3.94-.06-.26-.09-.53-.09-.8 0-1.93 1.57-3.5 3.5-3.5 1.01 0 1.92.43 2.56 1.11.8-.16 1.56-.45 2.24-.86-.26.81-.81 1.49-1.53 1.92.71-.08 1.39-.27 2.02-.55-.47.71-1.06 1.34-1.75 1.84z"/></svg>
            </a>
            <a href="#" aria-label="facebook" class="text-gray-600 hover:text-green-600">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 4.99 3.66 9.13 8.44 9.93v-7.04H8.08V12.1h2.36V9.85c0-2.33 1.38-3.62 3.49-3.62.99 0 2.03.18 2.03.18v2.24h-1.14c-1.12 0-1.47.7-1.47 1.42v1.7h2.5l-.4 2.86h-2.1V22c4.78-.8 8.44-4.94 8.44-9.93z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
/* keep styles minimal — most styling via Tailwind utility classes to match project */
</style>