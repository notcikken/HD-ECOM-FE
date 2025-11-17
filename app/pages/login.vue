<script setup lang="ts">
definePageMeta({
  layout: "auth",
  middleware: "guest",
});

import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "~/composables/useAuth";

// local UI state
const email = ref("");
const password = ref("");
const remember = ref(false);
const error = ref("");
const successMessage = ref("");

const router = useRouter();

// useAuth provides login, isLoading and errorMessage
const { login, errorMessage, isLoading } = useAuth();

const submit = async () => {
  // reset UI errors/messages
  error.value = "";
  successMessage.value = "";

  // Basic client-side validation
  if (!email.value || !password.value) {
    error.value = "Harap isi email dan kata sandi.";
    return;
  }

  if (password.value.length < 6) {
    error.value = "Kata sandi minimal 6 karakter.";
    return;
  }

  // call composable login (which uses authService internally)
  const result = await login({
    email: email.value,
    password: password.value,
  });

  if (result?.success) {
    successMessage.value = "Login berhasil! Mengalihkan...";
    const redirectTo = result.redirectTo || "/";
    setTimeout(() => {
      router.push(redirectTo).catch(() => {});
    }, 800);
  } else {
    // prefer explicit error from composable, fallback to generic or response msg
    error.value =
      result?.error ||
      errorMessage.value ||
      result?.response?.message ||
      "Login gagal. Silakan coba lagi.";
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#FFF7EA] px-6">
    <div class="max-w-3xl w-full justify-center items-center">
      <!-- Form -->
      <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <h3 class="text-xl font-semibold text-[#F79E0E] mb-4">
          Masuk ke SecondCycle Help Center
        </h3>
        <form @submit.prevent="submit" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              required
              :disabled="isLoading"
              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F79E0E]/20 outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label class="block text-sm text-gray-700 mb-1">Kata Sandi</label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              :disabled="isLoading"
              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F79E0E]/20 outline-none disabled:opacity-50"
            />
          </div>

          <div class="flex items-center justify-between text-sm">
            <label class="inline-flex items-center gap-2">
              <input
                type="checkbox"
                v-model="remember"
                :disabled="isLoading"
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
              :disabled="isLoading"
              class="w-full px-4 py-3 bg-[#F79E0E] text-white rounded-lg font-medium hover:bg-[#d96f00] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="flex items-center justify-center">
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Memproses...
              </span>
              <span v-else>Masuk</span>
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
          <p v-if="successMessage" class="text-sm text-green-600 mt-2">
            {{ successMessage }}
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
