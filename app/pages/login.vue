<template>
  <div class="min-h-screen flex items-center justify-center bg-[#FFF7EA] px-6">
    <div class="max-w-3xl w-full justify-center items-center">
      <!-- Form -->
      <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <h3 class="text-xl font-semibold text-[#F79E0E] mb-4">
          Masuk ke SecondCycle Help Center
        </h3>
        <form @submit.prevent="login" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F79E0E]/20 outline-none"
            />
          </div>

          <div>
            <label class="block text-sm text-gray-700 mb-1">Kata Sandi</label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F79E0E]/20 outline-none"
            />
          </div>

          <div class="flex items-center justify-between text-sm">
            <label class="inline-flex items-center gap-2">
              <input
                type="checkbox"
                v-model="remember"
                class="h-4 w-4 rounded border-gray-300"
              />
              <span class="text-gray-600">Ingat saya</span>
            </label>
            <NuxtLink to="/forgot" class="text-[#F79E0E] hover:underline"
              >Lupa kata sandi?</NuxtLink
            >
          </div>

          <div>
            <button
              type="submit"
              class="w-full px-4 py-3 bg-[#F79E0E] text-white rounded-lg font-medium hover:bg-[#d96f00] transition"
            >
              Masuk
            </button>
          </div>

          <div class="text-sm text-center text-gray-600">
            Belum punya akun?
            <NuxtLink
              to="/signup"
              class="text-[#F79E0E] font-medium hover:underline ml-1"
              >Daftar</NuxtLink
            >
          </div>

          <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: "auth" });

import { ref } from "vue";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const remember = ref(false);
const error = ref("");

const router = useRouter();

const login = async () => {
  error.value = "";
  // basic client-side validation
  if (!email.value || !password.value) {
    error.value = "Harap isi email dan kata sandi.";
    return;
  }

  // TODO: Replace with real auth call
  // fake success for any password length >= 6
  if (password.value.length < 6) {
    error.value = "Kata sandi minimal 6 karakter.";
    return;
  }

  // Simulate successful login then navigate to browse
  router.push({ path: "/browse", query: { topic: "Akun & Keamanan" } });
};
</script>

<style scoped>
/* minimal extra styles; layout via Tailwind */
</style>
