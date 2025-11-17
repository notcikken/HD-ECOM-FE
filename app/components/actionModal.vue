<script setup lang="ts">
import { X } from "lucide-vue-next";

interface Props {
  show: boolean;
  title: string;
  icon?: Component;
  iconBgClass?: string;
}

withDefaults(defineProps<Props>(), {
  show: false,
  icon: undefined,
  iconBgClass: "bg-gray-500",
});

const emit = defineEmits(["close"]);

const closeModal = () => {
  emit("close");
};
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div
        class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center gap-3 mb-4">
          <div
            v-if="icon"
            class="w-12 h-12 rounded-full flex items-center justify-center"
            :class="iconBgClass"
          >
            <component :is="icon" class="w-6 h-6 text-white" />
          </div>
          <h3 class="text-xl font-bold text-gray-800">{{ title }}</h3>
          <button
            class="ml-auto text-gray-400 hover:text-gray-600"
            @click="closeModal"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Content Slot -->
        <div class="mb-6">
          <slot />
        </div>

        <!-- Actions Slot -->
        <div class="flex gap-3">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </Transition>
</template>
