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

<script setup>
definePageMeta({
  layout: "auth",
  middleware: "guest",
});

import { ref } from "vue";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const remember = ref(false);
const error = ref("");
const successMessage = ref("");
const isLoading = ref(false);

const router = useRouter();
const config = useRuntimeConfig();

const login = async () => {
  error.value = "";
  successMessage.value = "";
  isLoading.value = true;

  try {
    // Basic client-side validation
    if (!email.value || !password.value) {
      error.value = "Harap isi email dan kata sandi.";
      isLoading.value = false;
      return;
    }

    if (password.value.length < 6) {
      error.value = "Kata sandi minimal 6 karakter.";
      isLoading.value = false;
      return;
    }

    console.log("Login attempt with:", {
      email: email.value,
      authBase: config.public.authBase,
    });

    // Make API call to Laravel JWT backend
    const response = await $fetch("/api/auth/login", {
      method: "POST",
      baseURL: config.public.authBase,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: {
        email: email.value,
        password: password.value,
      },
    });

    console.log("API Response:", response);

    // Check for token in response.data.token (not response.access_token)
    const token = response?.data?.token || response?.access_token;

    if (token) {
      console.log("Token received, storing...");

      // Store JWT token in cookie
      const authToken = useCookie("auth-token", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: remember.value ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
      });

      authToken.value = token;

      // Extract user data from response
      const userData = response?.data?.user;

      if (userData) {
        console.log("User data received:", userData);

        // Store user data
        const userDataCookie = useCookie("user-data", {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: remember.value ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
        });

        userDataCookie.value = JSON.stringify(userData);
        console.log("User data stored successfully");
      }

      // Show success message
      successMessage.value = "Login berhasil! Mengalihkan...";
      console.log("Login successful, redirecting...");

      // Add delay before redirect
      setTimeout(async () => {
        try {
          // Check user role to redirect appropriately
          if (userData?.role === 0 || userData?.role === "0") {
            console.log("Superadmin detected, redirecting to /dashboard");
            await router.push("/dashboard");
          } else {
            console.log("Regular user, redirecting to /");
            await router.push("/");
          }
        } catch (redirectError) {
          console.error("Redirect error:", redirectError);
        }
      }, 1000);
    } else {
      console.log("No token in response:", response);
      error.value = response?.message || "Login gagal. Silakan coba lagi.";
      isLoading.value = false;
    }
  } catch (err) {
    console.error("Login error:", err);
    console.error("Error response:", err.response);
    console.error("Error data:", err.data);

    // Handle different types of errors
    if (err.response?.status === 401) {
      error.value = "Email atau kata sandi salah.";
    } else if (err.response?.status === 422) {
      // Validation errors from Laravel
      const validationErrors = err.response._data?.errors;
      if (validationErrors) {
        error.value = Object.values(validationErrors).flat().join(", ");
      } else {
        error.value = "Data yang dimasukkan tidak valid.";
      }
    } else if (err.response?.status >= 500) {
      error.value = "Terjadi kesalahan server. Silakan coba lagi nanti.";
    } else {
      error.value =
        err.response?._data?.message ||
        err.message ||
        "Terjadi kesalahan. Silakan coba lagi.";
    }

    isLoading.value = false;
  }
};
</script>

<style scoped>
/* minimal extra styles; layout via Tailwind */
</style>
