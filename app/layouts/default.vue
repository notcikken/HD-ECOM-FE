<template>
  <div>
    <div class="sticky top-0 left-0 w-full z-50 ">
      <Navbar />
    </div>
    <div class="w-full  items-center justify-center mx-auto ">
      <NuxtPage />      
    </div>
    <div>
      <Footer />
    </div>
  </div>
</template>

<script setup>
import Navbar from '~/components/layouts/Navbar.vue';
import Footer from '~/components/layouts/Footer.vue';
</script>
