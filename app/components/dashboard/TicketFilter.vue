<script setup lang="ts">
interface Filters {
  status: string;
  category: string;
}

interface Props {
  modelValue: Filters;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Filters): void;
  (e: "change" | "reset"): void;
}>();

const updateFilter = (key: keyof Filters, value: string) => {
  emit("update:modelValue", {
    ...props.modelValue,
    [key]: value,
  });
  emit("change");
};

const handleReset = () => {
  emit("reset");
};
</script>

<template>
  <div class="bg-white rounded-xl p-6 border border-gray-200 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Status</label
        >
        <select
          :value="modelValue.status"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          @change="
            updateFilter('status', ($event.target as HTMLSelectElement).value)
          "
        >
          <option value="">Semua Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Kategori</label
        >
        <select
          :value="modelValue.category"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          @change="
            updateFilter('category', ($event.target as HTMLSelectElement).value)
          "
        >
          <option value="">Semua Kategori</option>
          <option value="Akun & Keamanan">Akun & Keamanan</option>
          <option value="Pembayaran">Pembayaran</option>
          <option value="Pengiriman">Pengiriman</option>
          <option value="Pengembalian">Pengembalian</option>
          <option value="Produk">Produk</option>
          <option value="Teknis Aplikasi">Teknis Aplikasi</option>
        </select>
      </div>

      <div class="flex items-end md:col-span-2">
        <button
          class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          @click="handleReset"
        >
          Reset Filter
        </button>
      </div>
    </div>
  </div>
</template>
