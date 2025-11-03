<script setup lang="ts">
import { ref } from 'vue';
import { useTicketApi } from '~/composables/useTicketApi';
import type { Ticket } from '~/types/ticket';

definePageMeta({ title: 'Contact Support', layout: 'default' });
const { createTicket } = useTicketApi();

const title = ref('');
const description = ref('');
const category = ref('');
const priority = ref<'low' | 'medium' | 'high' | 'urgent'>('medium');
const attachments = ref<File[]>([]);
const attachmentError = ref<string | null>(null);

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const MAX_FILES = 3;

const categories = [
  'Akun & Keamanan',
  'Pembayaran',
  'Pengiriman',
  'Pengembalian',
  'Teknis Aplikasi',
  'Produk',
];

const handleFileChange = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || []);
  attachmentError.value = null;

  if (files.length > MAX_FILES) {
    attachmentError.value = `Maksimal ${MAX_FILES} file yang dapat diunggah.`;
    return;
  }

  const invalidFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
  if (invalidFiles.length > 0) {
    attachmentError.value = `File terlalu besar (max 1MB): ${invalidFiles
      .map((f) => f.name)
      .join(', ')}`;
    return;
  }

  attachments.value = files;
};

const submitForm = async () => {
  error.value = null;
  success.value = null;

  if (!title.value || !description.value || !category.value) {
    error.value =
      'Harap isi semua field yang wajib (Title, Description, Category).';
    return;
  }

  loading.value = true;

  try {
    // For this mock API we include basic ticket fields. Attachments are optional and
    // not persisted by the mock API — we log the file info for now.
    if (attachments.value.length > 0) {
      console.log(
        'Attachments selected:',
        attachments.value.map((f) => `${f.name} (${f.type})`).join(', ')
      );
    }

    const payload: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.value,
      description:
        description.value +
        (attachments.value.length > 0
          ? `\n\nAttachments: ${attachments.value
              .map((f) => f.name)
              .join(', ')}`
          : ''),
      category: category.value,
      status: 'open',
      priority: priority.value,
      role: 'pelanggan',
      assignedTo: undefined,
    };

    const res = await createTicket(payload);

    if (res.success) {
      success.value = 'Pesan berhasil dikirim. Terima kasih.';
      // Reset form
      title.value = '';
      description.value = '';
      category.value = '';
      priority.value = 'medium';
      attachments.value = [];
      attachmentError.value = null;
      // Optional: navigate or keep on page
      // router.push("/");
    } else {
      error.value = res.message || 'Gagal mengirim pesan.';
    }
  } catch (err) {
    console.error(err);
    error.value = 'Terjadi kesalahan saat mengirim pesan.';
  } finally {
    loading.value = false;
  }
};
</script>
<template>
  <div class="max-w-3xl mx-auto py-12 px-6">
    <h1 class="text-2xl font-bold text-gray-800 mb-4">
      Kirim Pesan Bantuan / Keluhan
    </h1>
    <p class="text-sm text-gray-600 mb-6">
      Isi formulir berikut untuk mengirim keluhan atau permintaan bantuan. Field
      dengan tanda * wajib diisi.
    </p>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <form class="space-y-4" @submit.prevent="submitForm">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Title <span class="text-red-500">*</span></label
          >
          <input
            v-model="title"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F79E0E] focus:border-[#F79E0E]"
            placeholder="Ringkasan singkat masalah"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Description <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="description"
            rows="6"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F79E0E] focus:border-[#F79E0E] resize-y"
            placeholder="Jelaskan detail masalah atau langkah reproduksi..."
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Category <span class="text-red-500">*</span></label
            >
            <select
              v-model="category"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F79E0E] focus:border-[#F79E0E]"
            >
              <option value="">Pilih Kategori</option>
              <option v-for="c in categories" :key="c" :value="c">
                {{ c }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label
            class="block text-xs font-semibold tracking-wide text-gray-700 mb-2 uppercase"
          >
            Supporting Documents <span class="text-red-500">*</span>
          </label>
          <div class="space-y-3">
            <div class="relative">
              <div class="flex items-center gap-3">
                <label
                  class="px-4 py-2.5 bg-[#F79E0E]/10 text-[#F79E0E] border-2 border-[#F79E0E]/20 rounded-lg hover:bg-[#F79E0E]/15 transition cursor-pointer flex items-center gap-2 text-sm font-medium"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Pilih File
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    @change="handleFileChange"
                  />
                </label>
                <span class="text-sm text-gray-500">
                  {{ attachments.length }} file dipilih
                </span>
              </div>
            </div>

            <div class="text-xs text-gray-500 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Maksimal 3 file, ukuran masing-masing file maksimal 1MB (PDF atau
              gambar)
            </div>

            <div
              v-if="attachments.length > 0"
              class="bg-gray-50/50 rounded-lg p-3 space-y-2 border border-gray-100"
            >
              <div
                v-for="file in attachments"
                :key="file.name"
                class="flex items-center justify-between text-sm"
              >
                <div class="flex items-center gap-2">
                  <svg
                    v-if="file.type.includes('image')"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <span
                    class="text-gray-700 font-medium truncate max-w-[200px]"
                    >{{ file.name }}</span
                  >
                </div>
                <span class="text-gray-500 text-xs">
                  {{ (file.size / 1024).toFixed(1) }} KB
                </span>
              </div>
            </div>

            <p
              v-if="attachmentError"
              class="text-sm text-red-500 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {{ attachmentError }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 bg-[#F79E0E] text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
          >
            <span v-if="!loading">Kirim Pesan</span>
            <span v-else>Mengirim...</span>
          </button>

          <button
            type="button"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            @click="
              () => {
                title = '';
                description = '';
                category = '';
                priority = 'medium';
                attachments = [];
                attachmentError = null;
                error = null;
                success = null;
              }
            "
          >
            Reset
          </button>
        </div>

        <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
        <p v-if="success" class="text-sm text-green-600 mt-2">{{ success }}</p>
      </form>
    </div>
  </div>
</template>
