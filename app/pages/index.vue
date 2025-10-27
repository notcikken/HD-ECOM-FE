<template>
  <section class=" items-center justify-center mx-auto  ">
    <HeroSection />
  </section>
  <section class="items-center max-w-[1728px] justify-center mx-auto bg-[#FFF7EA] px-40 py-12 ">
    <TopicGridSection />
    <FaqSection />
  </section>
</template>

<script setup>
import HeroSection from '~/components/sections/HeroSection.vue';
import TopicGridSection from '~/components/sections/TopicGridSection.vue';
import FaqSection from '~/components/sections/FaqSection.vue';
</script>
