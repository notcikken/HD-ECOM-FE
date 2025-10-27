<template>
  <div class="min-h-screen">
    <!-- Hero section with full width -->
    <section class="w-full">
      <HeroSection />
    </section>

    <!-- Main content section with proper container -->
    <section class="w-full bg-[#FFF7EA]">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <TopicGridSection />
        <div class="mt-16 lg:mt-20">
          <FaqSection />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import HeroSection from '~/components/sections/HeroSection.vue';
import TopicGridSection from '~/components/sections/TopicGridSection.vue';
import FaqSection from '~/components/sections/FaqSection.vue';
</script>
