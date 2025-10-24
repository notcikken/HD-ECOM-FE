<template>
  <section class="p-6 text-center">
    <h1 class="text-2xl font-bold text-gray-800">Halaman Utama</h1>
    <p class="text-gray-600 mt-2">Ini adalah konten dari halaman index.vue</p>

    <!-- Contoh panggil HeroSection -->
    <HeroSection />
  </section>
</template>

<script setup>
import HeroSection from '~/components/sections/HeroSection.vue';
</script>
