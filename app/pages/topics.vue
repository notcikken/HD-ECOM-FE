<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ChevronDown } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

// slug from query ?topic=akun-keamanan or path param if you prefer
const slug = computed(() =>
  route.query.topic ? String(route.query.topic) : "akun-keamanan"
);
const selectedSubtopic = ref(route.query.sub ? String(route.query.sub) : null);
watch(
  () => route.query.sub,
  (v) => {
    selectedSubtopic.value = v ? String(v) : null;
  }
);

// NEW: track opened question id for accordion
const openQuestion = ref(null);

function selectSubtopic(slugSub) {
  selectedSubtopic.value = selectedSubtopic.value === slugSub ? null : slugSub;
  // update query so url reflects selection
  router.replace({
    query: {
      ...route.query,
      topic: slug.value,
      sub: selectedSubtopic.value || undefined,
    },
  });
}

function toggleQuestion(id) {
  openQuestion.value = openQuestion.value === id ? null : id;
}

// sample dataset structured to match screenshot
const topicsData = {
  "akun-keamanan": {
    title: "Akun Saya",
    subtopics: [
      { title: "Privasi Akun", slug: "privasi-akun" },
      { title: "Cara Daftar & Login", slug: "cara-daftar-login" },
      { title: "Seputar Keamanan Akun", slug: "seputar-keamanan-akun" },
      { title: "Kendala Login", slug: "kendala-login" },
      { title: "Atur Akun", slug: "atur-akun" },
    ],
    questions: [
      {
        id: 1,
        question: "Cara Mengubah Email Akun SecondCycle",
        sub: "privasi-akun",
        answer:
          "Masuk ke Pengaturan > Akun > Ubah Email. Ikuti instruksi verifikasi yang dikirim ke email lama dan baru.",
      },
      {
        id: 2,
        question: "Bagaimana Cara Mengaktifkan Fitur Simpan Akun?",
        sub: "seputar-keamanan-akun",
        answer:
          "Buka Pengaturan > Keamanan > Aktifkan opsi 'Simpan Akun'. Pastikan perangkat Anda aman.",
      },
      {
        id: 3,
        question: "Bagaimana Cara Mengaktifkan Fitur Keamanan Akun?",
        sub: "seputar-keamanan-akun",
        answer:
          "Aktifkan 2FA di halaman Keamanan dan gunakan kata sandi yang kuat. Ikuti panduan di layar untuk konfigurasi.",
      },
      {
        id: 4,
        question: "Saya Ingin Tutup Akun",
        sub: "atur-akun",
        answer:
          "Hubungi tim dukungan melalui formulir kontak. Siapkan data verifikasi akun.",
      },
      {
        id: 5,
        question: "Cara Ubah Kata Sandi SecondCycle",
        sub: "seputar-keamanan-akun",
        answer:
          "Masuk ke Pengaturan > Keamanan > Ubah Kata Sandi. Masukkan kata sandi lama dan kata sandi baru.",
      },
      {
        id: 6,
        question: "Cara Daftar Akun SecondCycle",
        sub: "cara-daftar-login",
        answer:
          "Klik tombol Daftar, isi data yang diminta, lalu verifikasi email/nomor HP.",
      },
      {
        id: 7,
        question: "Bagaimana Cara Verifikasi Nomor Handphone?",
        sub: "privasi-akun",
        answer:
          "Masukkan nomor HP di halaman Profil, lalu masukkan kode OTP yang dikirim via SMS.",
      },
      {
        id: 8,
        question: "Akun SecondCycle Diblokir",
        sub: "kendala-login",
        answer:
          "Periksa email dari kami untuk alasan blokir atau hubungi layanan pelanggan.",
      },
      {
        id: 9,
        question: "Jaga Keamanan Akun SecondCycle",
        sub: "seputar-keamanan-akun",
        answer:
          "Jangan bagikan kata sandi, aktifkan 2FA, dan waspada terhadap link phishing.",
      },
      {
        id: 10,
        question: "Saya Ingin Ubah Nomor Handphone yang Tidak Aktif",
        sub: "privasi-akun",
        answer:
          "Ajukan permintaan perubahan nomor dengan verifikasi identitas melalui pusat bantuan.",
      },
    ],
  },

  pembayaran: {
    title: "Pembayaran",
    subtopics: [
      { title: "Metode Pembayaran", slug: "metode-pembayaran" },
      { title: "Refund", slug: "refund" },
    ],
    questions: [
      {
        id: 1,
        question: "Metode pembayaran apa saja?",
        sub: "metode-pembayaran",
        answer:
          "Kami menerima kartu kredit, transfer bank, dan e-wallet. Metode dapat berbeda per lokasi.",
      },
    ],
  },
};

const currentTopic = computed(() => {
  return topicsData[slug.value] ?? { title: "", subtopics: [], questions: [] };
});

// filter questions by selected subtopic if any
const displayedQuestions = computed(() => {
  const list = currentTopic.value.questions || [];
  if (selectedSubtopic.value) {
    return list.filter((q) => q.sub === selectedSubtopic.value);
  }
  return list;
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <nav class="text-sm text-gray-500 mb-4">
      <NuxtLink to="/" class="text-[#F79E0E] hover:underline"
        >Help Center</NuxtLink
      >
      <span class="mx-2">/</span>
      <span class="text-gray-700">Akun & Keamanan</span>
    </nav>

    <!-- Search Column -->
    <div
      class="flex items-center bg-white rounded-lg shadow-sm px-3 py-2 mb-5 border border-gray-200 hover:shadow-md focus-within:shadow-md"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5 text-gray-500 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-4.35-4.35m1.6-5.4a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        v-model="query"
        placeholder="Ketik kata kunci (misal: promosi berlangsung)"
        type="text"
        class="w-full outline-none text-gray-700 placeholder-gray-500"
        @focus="isFocused = true"
        @blur="handleBlur"
      />
    </div>

    <!-- mobile: show subtopics as horizontal list -->
    <div class="lg:hidden mt-4 mb-2">
      <div class="overflow-x-auto">
        <div class="flex gap-3">
          <button
            v-for="s in currentTopic.subtopics"
            :key="s.slug"
            :class="[
              'whitespace-nowrap px-4 py-2 mb-1 rounded',
              selectedSubtopic === s.slug ? 'bg-[#FFF1C1]' : 'bg-white',
            ]"
            @click="selectSubtopic(s.slug)"
          >
            {{ s.title }}
          </button>
        </div>
      </div>
    </div>

    <div class="flex gap-8">
      <!-- Sidebar -->
      <aside
        v-if="
          currentTopic &&
          currentTopic.subtopics &&
          currentTopic.subtopics.length
        "
        class="w-64 hidden lg:block"
      >
        <aside
          v-if="
            currentTopic &&
            currentTopic.subtopics &&
            currentTopic.subtopics.length
          "
          class="w-64 hidden lg:block"
        />
        <div class="bg-[#FFF1C1] rounded-lg shadow-sm p-4">
          <ul class="space-y-2">
            <li
              v-for="(s, i) in currentTopic.subtopics"
              :key="i"
              :class="[
                'cursor-pointer px-3 py-2 rounded',
                selectedSubtopic === s.slug
                  ? 'bg-gray-100 font-medium'
                  : 'text-gray-600 hover:bg-white/40',
              ]"
              @click="selectSubtopic(s.slug)"
            >
              {{ s.title }}
            </li>
          </ul>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">
          Yang sering ditanyakan
        </h1>

        <div
          v-if="displayedQuestions.length"
          class="bg-[#FFF1C1] rounded-lg shadow-sm"
        >
          <!-- Accordion list -->
          <div
            v-for="q in displayedQuestions"
            :key="q.id"
            class="px-6 py-2 hover:bg-white/40"
          >
            <button
              type="button"
              :aria-expanded="openQuestion === q.id"
              class="w-full flex items-center justify-between py-4 text-left"
              @click="toggleQuestion(q.id)"
            >
              <span class="text-lg font-medium text-gray-800">{{
                q.question
              }}</span>
              <div class="flex items-center space-x-2 shrink-0">
                <span
                  class="text-xs px-2 py-1 bg-[#F79E0E]/10 text-[#F79E0E] rounded-full font-medium"
                >
                  Detail
                </span>

                <!-- single icon that rotates when open -->
                <ChevronDown
                  class="w-5 h-5 text-gray-400 transform transition-transform duration-200"
                  :class="{ 'rotate-180': openQuestion === q.id }"
                  aria-hidden="true"
                />
              </div>
            </button>

            <div
              v-show="openQuestion === q.id"
              class="px-6 pb-4 text-sm text-gray-600"
            >
              {{ q.answer }}
            </div>
          </div>
        </div>

        <div v-else class="text-gray-500">
          Tidak ada pertanyaan untuk topik / subtopik ini.
        </div>
      </main>
    </div>
  </div>
</template>
