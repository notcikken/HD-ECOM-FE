<script setup>
import { ref, computed, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ChevronDown } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

// NEW: track opened question id for accordion
const openQuestion = ref(null);

const DEFAULT_TOPIC = "akun-keamanan";
const selectedTopic = computed(() =>
  route.query.topic ? String(route.query.topic) : DEFAULT_TOPIC
);

// Question id from FAQ
const questionFromFaq = computed(() =>
  route.query.q ? Number(route.query.q) : null
);
watch(
  questionFromFaq,
  (id) => {
    if (id) {
      openQuestion.value = id;
    }
  },
  { immediate: true }
);

const questionId = computed(() =>
  route.query.q ? Number(route.query.q) : null
);
watch(
  questionId,
  (id) => {
    openQuestion.value = id || null;
  },
  { immediate: true }
);

// sample dataset structured to match screenshot
const helpCenterData = {
  topics: [
    { title: "Akun & Keamanan", slug: "akun-keamanan" },
    { title: "Pembayaran", slug: "pembayaran" },
    { title: "Pengiriman", slug: "pengiriman" },
    { title: "Pengembalian", slug: "pengembalian" },
    { title: "Promo & Voucher", slug: "promo-voucher" },
    { title: "Teknis Aplikasi", slug: "teknis-aplikasi" },
    { title: "Produk", slug: "produk" },
    { title: "Lainnya", slug: "lainnya" },
  ],
  questions: [
    {
      id: 1,
      question: "Cara Mengubah Email Akun SecondCycle",
      slug: "akun-keamanan",
      answer:
        "Masuk ke Pengaturan > Akun > Ubah Email. Ikuti instruksi verifikasi yang dikirim ke email lama dan baru.",
    },
    {
      id: 2,
      question: "Metode pembayaran apa saja?",
      slug: "pembayaran",
      answer: "Kami menerima kartu kredit, transfer bank, dan e-wallet",
    },
    {
      id: 3,
      question: "Saya Belum Terima Pesanan",
      slug: "pengiriman",
      answer:
        "Periksa status pesanan Anda di halaman riwayat transaksi. Jika sudah melewati estimasi waktu pengiriman, hubungi penjual atau layanan pelanggan untuk penyelesaian lebih lanjut.",
    },
    {
      id: 4,
      question: "GoPay Later by PT Multifinance Anak Bangsa",
      slug: "pembayaran",
      answer:
        "GoPay Later adalah layanan kredit digital yang memungkinkan Anda berbelanja sekarang dan bayar nanti dengan tenor pembayaran yang fleksibel hingga 12 bulan.",
    },
    {
      id: 5,
      question: "Informasi Penonaktifan Produk Investasi",
      slug: "lainnya",
      answer:
        "Layanan investasi emas dan reksa dana sementara dinonaktifkan untuk peningkatan sistem dan keamanan. Informasi lebih lanjut akan diumumkan melalui aplikasi dan email.",
    },
    {
      id: 6,
      question: "Cara Daftar Akun SecondCycle",
      slug: "akun-keamanan",
      answer:
        "Klik tombol Daftar, isi data yang diminta, lalu verifikasi email/nomor HP.",
    },
    {
      id: 7,
      question: "Bagaimana Cara Verifikasi Nomor Handphone?",
      slug: "akun-keamanan",
      answer:
        "Masukkan nomor HP di halaman Profil, lalu masukkan kode OTP yang dikirim via SMS.",
    },
    {
      id: 8,
      question: "Akun SecondCycle Diblokir",
      slug: "akun-keamanan",
      answer:
        "Periksa email dari kami untuk alasan blokir atau hubungi layanan pelanggan.",
    },
    {
      id: 9,
      question: "Jaga Keamanan Akun SecondCycle",
      slug: "akun-keamanan",
      answer:
        "Jangan bagikan kata sandi, aktifkan 2FA, dan waspada terhadap link phishing.",
    },
    {
      id: 10,
      question: "Saya Ingin Ubah Nomor Handphone yang Tidak Aktif",
      slug: "akun-keamanan",
      answer:
        "Ajukan permintaan perubahan nomor dengan verifikasi identitas melalui pusat bantuan.",
    },
  ],
};

const currentTopic = computed(() => selectedTopic.value);

watchEffect(() => {
  const topic = route.query.topic;
  const validSlugs = helpCenterData.topics.map((t) => t.slug);
  if (!topic || !validSlugs.includes(String(topic))) {
    router.replace({
      path: "/topics",
      query: { ...route.query, topic: DEFAULT_TOPIC },
    });
  }
});

const selectTopic = (slug) => {
  router.replace({
    path: "/topics",
    query: { ...route.query, topic: slug },
  });
};

// SEARCH STATE
const searchQuery = ref(route.query.search ? String(route.query.search) : "");

watch(
  () => route.query.search,
  (val) => {
    searchQuery.value = val ? String(val) : "";
  }
);

// daftar pertanyaan default berdasarkan topik aktif
const questionsByTopic = computed(() =>
  helpCenterData.questions.filter((q) => q.slug === selectedTopic.value)
);

const filteredQuestions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return questionsByTopic.value;

  return helpCenterData.questions.filter((item) => {
    const text = `${item.question} ${item.answer}`.toLowerCase();
    const topicTitle =
      helpCenterData.topics
        .find((t) => t.slug === item.slug)
        ?.title.toLowerCase() || "";
    return text.includes(q) || topicTitle.includes(q);
  });
});

function toggleQuestion(id) {
  openQuestion.value = openQuestion.value === id ? null : id;
}

watch(
  filteredQuestions,
  (questions) => {
    if (!searchQuery.value || !questions.length) return;

    // hitung slug yang paling sering muncul di hasil
    const counts = questions.reduce((acc, q) => {
      acc[q.slug] = (acc[q.slug] || 0) + 1;
      return acc;
    }, {});

    const bestSlug = Object.entries(counts).sort(
      (a, b) => b[1] - a[1]
    )[0][0];

    if (bestSlug && bestSlug !== selectedTopic.value) {
      router.replace({
        path: "/topics",
        query: {
          ...route.query,
          topic: bestSlug,
        },
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <nav class="text-sm text-gray-500 mb-4">
      <NuxtLink to="/" class="text-[#F79E0E] hover:underline"
        >Help Center</NuxtLink
      >
      <span class="mx-2">/</span>
      <span class="text-gray-700">
        {{
          helpCenterData.topics.find((t) => t.slug === selectedTopic)?.title ||
          "Akun & Keamanan"
        }}
      </span>
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
        v-model="searchQuery"
        placeholder="Ketik kata kunci (misal: promosi berlangsung)"
        type="text"
        class="w-full outline-none text-gray-700 placeholder-gray-500"
      />
    </div>

    <!-- mobile: show subtopics as horizontal list -->
    <div class="lg:hidden mt-4 mb-2">
      <div class="overflow-x-auto">
        <div class="flex gap-3">
          <button
            v-for="s in helpCenterData.topics"
            :key="s.slug"
            :class="[
              'whitespace-nowrap px-4 py-2 mb-1 rounded',
              selectedTopic === s.slug ? 'bg-[#FFF1C1]' : 'bg-white',
            ]"
            @click="selectTopic(s.slug)"
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
          currentTopic && helpCenterData.topics && helpCenterData.topics.length
        "
        class="w-64 hidden lg:block"
      >
        <aside
          v-if="
            currentTopic &&
            helpCenterData.topics &&
            helpCenterData.topics.length
          "
          class="w-64 hidden lg:block"
        />
        <div class="bg-[#FFF1C1] rounded-lg shadow-sm p-4">
          <ul class="space-y-2">
            <li
              v-for="s in helpCenterData.topics"
              :key="s.slug"
              :class="[
                'cursor-pointer px-3 py-2 rounded',
                selectedTopic === s.slug
                  ? 'bg-white/40 font-medium'
                  : 'text-gray-600 hover:bg-white/40',
              ]"
              @click="selectTopic(s.slug)"
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
        <p class="text-sm text-gray-500 mb-4">
          <span v-if="searchQuery">
            Hasil untuk: "<span class="font-semibold">{{ searchQuery }}</span
            >"
          </span>
          <span v-else>
            Menampilkan pertanyaan tentang
            <span class="font-semibold">
              {{
                helpCenterData.topics.find((t) => t.slug === selectedTopic)
                  ?.title
              }}
            </span>
          </span>
        </p>

        <div
          v-if="filteredQuestions.length"
          class="bg-[#FFF1C1] rounded-lg shadow-sm"
        >
          <!-- Accordion list -->
          <div
            v-for="q in filteredQuestions"
            :key="q.id"
            class="px-6 py-2 pb-3 hover:bg-white/40"
          >
            <button
              type="button"
              :aria-expanded="openQuestion === q.id"
              class="w-full flex items-center justify-between py-4 text-left"
              @click="toggleQuestion(q.id)"
            >
              <span class="text-lg font-medium text-gray-800">
                {{ q.question }}
              </span>
              <div class="flex items-center space-x-2 shrink-0">
                <ChevronDown
                  class="w-5 h-5 text-gray-400 transform transition-transform duration-300"
                  :class="{ 'rotate-180': openQuestion === q.id }"
                  aria-hidden="true"
                />
              </div>
            </button>

            <div
              v-show="openQuestion === q.id"
              class="text-gray-800 bg-white/60 rounded-xl p-6 border border-orange-100/30"
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
