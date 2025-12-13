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
          <option value="1">Open</option>
          <option value="2">In Progress</option>
          <option value="3">Resolved</option>
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
          <option value="1">Akun & Keamanan</option>
          <option value="2">Pembayaran</option>
          <option value="3">Pengiriman</option>
          <option value="4">Pengembalian</option>
          <option value="5">Promo & Voucher</option>
          <option value="6">Teknis Aplikasi</option>
          <option value="7">Produk</option>
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
