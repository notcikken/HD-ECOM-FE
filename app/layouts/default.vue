<template>
  <div class="min-h-screen flex flex-col">
    <!-- Sticky navigation header -->
    <header class="sticky top-0 left-0 w-full z-50">
      <Navbar />
    </header>

    <!-- Main content area with proper spacing -->
    <main class="flex-1 w-full">
      <NuxtPage />
    </main>

    <!-- Footer section -->
    <footer class="mt-auto">
      <Footer />
    </footer>

    <!-- Chat Popup -->
    <ChatPopup />
  </div>
</template>

<script setup>
import Navbar from "~/components/layouts/Navbar.vue";
import Footer from "~/components/layouts/Footer.vue";
import ChatPopup from "~/components/chat/ChatPopup.vue";
</script>
