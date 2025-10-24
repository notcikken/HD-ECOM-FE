<template>
  <div class="">
    <h1 class="text-center">Pilih topik sesuai kendala pembelianmu</h1>
    <div class="grid grid-cols-4 gap-4 mt-6">
      <div
        v-for="(topic, index) in Array.from({ length: 8 }).map((_, i) => i + 1)"
        :key="index"
        class="py-4 px-4 w-full bg-white rounded-md flex items-center space-x-4 shadow-md"
      >
        <img
          src="/icons/ic_akun_saya_v4.png"
          alt="icon akun"
          class="w-12 h-12"
        />
        <h1>Akun & Keamanan {{ topic }}</h1>
      </div>
    </div>
  </div>
</template>
