<script setup lang="ts">
import { ref } from 'vue';
import { ticketService } from '~/services/ticketService';
import SidebarTickets from '~/components/SidebarTickets.vue';
import type { Ticket } from '~/types/ticket';
import {
  Upload,
  Info,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ImageIcon,
  FileText,
  Headphones,
  Clock,
  Shield,
  Zap,
} from 'lucide-vue-next';

definePageMeta({ title: 'Contact Support', layout: 'default' });

const title = ref('');
const description = ref('');
const category = ref(''); // This will store the category ID
const attachments = ref<File[]>([]);
const attachmentError = ref<string | null>(null);

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const MAX_FILES = 3;

const categories = ref<{id_category: number; nama_category: string}[]>([]);
const categoriesLoading = ref(false);
const categoriesLoaded = ref(false);

// Updated to use ticketService
const fetchCategoriesOnClick = async () => {
  if (categoriesLoaded.value || categoriesLoading.value) return;
  
  categoriesLoading.value = true;
  try {
    const response = await ticketService.fetchTicketCategories();
    categories.value = response;
    categoriesLoaded.value = true;
  } catch (error) {
    console.error('Failed to load categories:', error);
    // Fallback to hardcoded categories if API fails
    categories.value = [
      { id_category: 1, nama_category: 'Akun & Keamanan' },
      { id_category: 2, nama_category: 'Pembayaran' },
      { id_category: 3, nama_category: 'Pengiriman' },
      { id_category: 4, nama_category: 'Pengembalian' },
      { id_category: 6, nama_category: 'Teknis Aplikasi' },
      { id_category: 7, nama_category: 'Produk' },
    ];
    categoriesLoaded.value = true;
  } finally {
    categoriesLoading.value = false;
  }
};

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

const resetForm = () => {
  title.value = '';
  description.value = '';
  category.value = '';
  attachments.value = [];
  attachmentError.value = null;
  error.value = null;
  success.value = null;
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
    // Prepare ticket payload
    const payload = {
      judul: title.value,
      deskripsi: description.value,
      id_category: parseInt(category.value),
    };

    // Create ticket with attachments
    const ticket = await ticketService.createTicketWithAttachments(
      payload,
      attachments.value
    );

    if (attachments.value.length > 0) {
      success.value = `Pesan berhasil dikirim dengan ${attachments.value.length} file lampiran. Terima kasih.`;
    } else {
      success.value = 'Pesan berhasil dikirim. Terima kasih.';
    }
    
    resetForm();
  } catch (err) {
    console.error(err);
    error.value = 'Terjadi kesalahan saat mengirim pesan.';
  } finally {
    loading.value = false;
  }
};

// add userTickets state
const userTickets = ref<Ticket[]>([]); // array of Ticket, bisa diisi dari API onMounted

function handleDeleteTicket(ticket: Ticket): void {
  // hapus via API lalu update userTickets
  userTickets.value = userTickets.value.filter((t) => t.id !== ticket.id);
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-24 px-4"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Kirim Pesan Bantuan / Keluhan
        </h1>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Isi formulir berikut untuk mengirim keluhan atau permintaan bantuan.
          Field dengan tanda
          <span class="text-red-500 font-semibold">*</span> wajib diisi.
        </p>
      </div>

      <!-- Main Content Grid -->
      <div class="grid lg:grid-cols-5 gap-8 items-start">
        <!-- Illustration Side - Larger -->
        <div class="lg:col-span-2">
          <div class="sticky top-8">
            <!-- Support Image -->
            <div class="">
              <img
                src="/images/support.png"
                alt="Customer Support"
                class="w-full rounded-2xl -mt-12"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
              />
              <!-- Fallback Icon if image fails -->
              <div
                class="hidden bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl aspect-square items-center justify-center"
              >
                <Headphones :size="120" class="text-[#F79E0E]" />
              </div>
            </div>

            <!-- Info Card -->
            <div class="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 class="text-2xl font-bold text-gray-800 mb-2">
                Kami Siap Membantu!
              </h3>
              <p class="text-gray-600 mb-6">
                Tim support kami akan merespons pertanyaan Anda dalam waktu 1x24
                jam
              </p>

              <!-- Features List -->
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <div
                    class="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"
                  >
                    <Clock :size="20" class="text-green-600" />
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-800 text-sm">
                      Respon Cepat
                    </h4>
                    <p class="text-xs text-gray-600">
                      Balasan dalam 24 jam kerja
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div
                    class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
                  >
                    <Shield :size="20" class="text-blue-600" />
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-800 text-sm">
                      Data Aman
                    </h4>
                    <p class="text-xs text-gray-600">
                      Informasi Anda terlindungi
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div
                    class="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"
                  >
                    <Zap :size="20" class="text-purple-600" />
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-800 text-sm">
                      Solusi Efektif
                    </h4>
                    <p class="text-xs text-gray-600">
                      Penyelesaian yang disesuaikan
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <SidebarTickets
              class="mt-6"
            />
          </div>
        </div>

        <!-- Form Side - Larger -->
        <div class="lg:col-span-3">
          <div class="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100">
            <form class="space-y-6" @submit.prevent="submitForm">
              <!-- Title Field -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="title"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F79E0E] focus:border-[#F79E0E] transition"
                  placeholder="Ringkasan singkat masalah"
                />
              </div>

              <!-- Description Field -->
              <div class="h-full">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="description"
                  rows="11"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F79E0E] focus:border-[#F79E0E] transition h-full"
                  placeholder="Jelaskan detail masalah atau langkah reproduksi..."
                />
              </div>

              <!-- Category Field -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="category"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F79E0E] focus:border-[#F79E0E] transition"
                  @click="fetchCategoriesOnClick"
                >
                  <option value="">Pilih Kategori</option>
                  <template v-if="categoriesLoading">
                    <option disabled>Loading categories...</option>
                  </template>
                  <template v-else>
                    <option 
                      v-for="c in categories" 
                      :key="c.id_category" 
                      :value="c.id_category"
                    >
                      {{ c.nama_category }}
                    </option>
                  </template>
                </select>
              </div>

              <!-- File Upload -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Supporting Documents
                  <span class="text-gray-500 text-xs font-normal"
                    >(Opsional)</span
                  >
                </label>

                <div class="space-y-3">
                  <!-- Upload Button -->
                  <label
                    class="flex items-center justify-center gap-2 px-4 py-3 bg-[#F79E0E]/10 text-[#F79E0E] border-2 border-dashed border-[#F79E0E]/30 rounded-lg hover:bg-[#F79E0E]/20 transition cursor-pointer"
                  >
                    <Upload :size="20" />
                    <span class="font-medium">
                      {{
                        attachments.length > 0
                          ? `${attachments.length} file dipilih`
                          : 'Pilih File'
                      }}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      class="hidden"
                      @change="handleFileChange"
                    />
                  </label>

                  <!-- Info Text -->
                  <p class="text-xs text-gray-500 flex items-start gap-2">
                    <Info :size="16" class="mt-0.5 flex-shrink-0" />
                    <span
                      >Maksimal 3 file, ukuran masing-masing file maksimal 1MB
                      (PDF atau gambar)</span
                    >
                  </p>

                  <!-- File List -->
                  <div
                    v-if="attachments.length > 0"
                    class="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200"
                  >
                    <div
                      v-for="file in attachments"
                      :key="file.name"
                      class="flex items-center justify-between text-sm bg-white p-2 rounded border border-gray-100"
                    >
                      <div class="flex items-center gap-2 flex-1 min-w-0">
                        <ImageIcon
                          v-if="file.type.includes('image')"
                          :size="16"
                          class="text-gray-400 flex-shrink-0"
                        />
                        <FileText
                          v-else
                          :size="16"
                          class="text-gray-400 flex-shrink-0"
                        />
                        <span class="text-gray-700 truncate">{{
                          file.name
                        }}</span>
                      </div>
                      <span class="text-gray-500 text-xs ml-2 flex-shrink-0">
                        {{ (file.size / 1024).toFixed(1) }} KB
                      </span>
                    </div>
                  </div>

                  <!-- Error Message -->
                  <p
                    v-if="attachmentError"
                    class="text-sm text-red-600 flex items-center gap-2"
                  >
                    <AlertCircle :size="16" />
                    {{ attachmentError }}
                  </p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  :disabled="loading"
                  class="flex-1 px-6 py-3 bg-[#F79E0E] text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
                >
                  <span v-if="!loading">Kirim Pesan</span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <Loader2 :size="20" class="animate-spin" />
                    Mengirim...
                  </span>
                </button>

                <button
                  type="button"
                  class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                  @click="resetForm"
                >
                  Reset
                </button>
              </div>

              <!-- Success/Error Messages -->
              <div
                v-if="error"
                class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2"
              >
                <AlertCircle :size="20" class="flex-shrink-0 mt-0.5" />
                <span>{{ error }}</span>
              </div>

              <div
                v-if="success"
                class="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2"
              >
                <CheckCircle2 :size="20" class="flex-shrink-0 mt-0.5" />
                <span>{{ success }}</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>