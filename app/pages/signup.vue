<template>
  <div class="min-h-screen flex items-center justify-center bg-[#FFF7EA] px-6">
    <div
      class="max-w-3xl w-full bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
    >
      <h3 class="text-xl font-semibold text-[#F79E0E] mb-4">Buat akun baru</h3>

      <form @submit.prevent="signup" class="space-y-4">
        <div>
          <label class="block text-sm text-gray-700 mb-1">Nama Lengkap</label>
          <input
            v-model="name"
            type="text"
            required
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F79E0E]/20 outline-none"
          />
        </div>

        <div>
          <label class="block text-sm text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F79E0E]/20 outline-none"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <label class="block text-sm text-gray-700 mb-1"
              >Konfirmasi Kata Sandi</label
            >
            <input
              v-model="confirm"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F79E0E]/20 outline-none"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="w-full px-4 py-3 bg-[#F79E0E] text-white rounded-lg font-medium hover:bg-[#d96f00] transition"
          >
            Daftar
          </button>
        </div>

        <div class="text-sm text-center text-gray-600">
          Sudah punya akun?
          <NuxtLink
            to="/login"
            class="text-[#F79E0E] font-medium hover:underline ml-1"
            >Masuk</NuxtLink
          >
        </div>

        <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
definePageMeta({ layout: "auth" });

const name = ref("");
const email = ref("");
const password = ref("");
const confirm = ref("");
const error = ref("");

const router = useRouter();

const signup = async () => {
  error.value = "";
  if (!name.value || !email.value || !password.value || !confirm.value) {
    error.value = "Semua field harus diisi.";
    return;
  }
  if (password.value.length < 6) {
    error.value = "Kata sandi minimal 6 karakter.";
    return;
  }
  if (password.value !== confirm.value) {
    error.value = "Kata sandi dan konfirmasi tidak cocok.";
    return;
  }

  // TODO: call signup API
  // Simulate success
  router.push("/login");
};
</script>

<style scoped>
/* minimal extra styles; layout via Tailwind */
</style>
