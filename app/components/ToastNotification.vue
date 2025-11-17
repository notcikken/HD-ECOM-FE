<script setup lang="ts">
import { CheckCircle, XCircle } from "lucide-vue-next";

interface Props {
  show: boolean;
  message: string;
  type: "success" | "error";
}

defineProps<Props>();
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-2 opacity-0"
  >
    <div v-if="show" class="fixed top-4 right-4 z-50 max-w-md">
      <div
        class="rounded-lg shadow-lg p-4 flex items-center gap-3"
        :class="
          type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        "
      >
        <CheckCircle v-if="type === 'success'" class="w-5 h-5" />
        <XCircle v-else class="w-5 h-5" />
        <span class="font-medium">{{ message }}</span>
      </div>
    </div>
  </Transition>
</template>
