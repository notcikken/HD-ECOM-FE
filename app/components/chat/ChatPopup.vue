<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onUnmounted, computed } from "vue";
import { MessageCircle, X, Send, Headphones, Sparkles } from "lucide-vue-next";
import { useWebsocket } from "~/composables/useWebsocket";
import { useMessage } from "~/composables/useMessage";

const isOpen = ref(false);
const newMessage = ref("");
const isSending = ref(false);
const unreadCount = ref(0);
const showQuickReplies = ref(false);
const isLoadingHistory = ref(false);

const quickReplies = [
  "Halo, saya butuh bantuan",
  "Status pesanan saya?",
  "Cara refund?",
  "Masalah pembayaran",
];

// WebSocket setup
const config = useRuntimeConfig();
const wsUrl = `${config.public.wsBase}/api/ws`;

const {
  isConnected,
  connectionError,
  connect,
  disconnect,
  sendChatMessage,
  onMessage,
  reconnect,
} = useWebsocket(wsUrl);

// Message management
const {
  messages,
  recentlySentMessages,
  currentUserId,
  conversationId,
  messagesContainer,
  addMessage,
  handleWebSocketMessage,
  createOptimisticMessage,
  removeOptimisticMessage,
  initializeFromStorage,
  addWelcomeMessage,
  scrollToBottom,
  formatTime,
} = useMessage();

const connectionStatus = computed(() => {
  if (isConnected.value) return "Connected";
  if (connectionError.value) return "Disconnected";
  return "Connecting...";
});

// Handle incoming WebSocket messages
onMounted(() => {
  onMessage((data) => {
    const result = handleWebSocketMessage(data, isOpen.value);

    // Handle specific result types
    if (result.type === "conversation_loaded") {
      isLoadingHistory.value = true;
    }

    if (result.type === "message_history") {
      isLoadingHistory.value = false;
    }

    // Update unread count if chat is closed and new message arrives
    if (!isOpen.value && result.type === "new_message") {
      if (result.message && !result.message.isUser) {
        unreadCount.value++;
      }
    }
  });

  // Initialize from localStorage
  initializeFromStorage();

  // Show welcome message
  addWelcomeMessage();
  unreadCount.value = 1;
});

onUnmounted(() => {
  disconnect();
});

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    unreadCount.value = 0;
    showQuickReplies.value = true;

    if (!isConnected.value) {
      connect();
    }

    nextTick(() => {
      scrollToBottom();
    });
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || isSending.value || !isConnected.value) return;

  const messageText = newMessage.value.trim();
  const tempId = Date.now();

  // Track recently sent
  recentlySentMessages.value.add(messageText);

  // Create and add optimistic message
  const userMessage = createOptimisticMessage(messageText, tempId);
  messages.value.push(userMessage);

  newMessage.value = "";
  showQuickReplies.value = false;
  isSending.value = true;

  await nextTick();
  scrollToBottom();

  try {
    await sendChatMessage(messageText, conversationId.value || undefined);

    isSending.value = false;
  } catch (error) {
    console.error("Error sending message:", error);
    isSending.value = false;

    // Remove from recently sent
    recentlySentMessages.value.delete(messageText);

    // Remove optimistic message
    removeOptimisticMessage(tempId);

    // Add error message
    addMessage({
      id: Date.now(),
      text: "Maaf, pesan gagal terkirim. Silakan coba lagi.",
      isUser: false,
      timestamp: new Date(),
      isOptimistic: false,
    });
  }
};

const sendQuickReply = (reply: string) => {
  newMessage.value = reply;
  sendMessage();
};

// Auto-scroll on new messages
watch(
  () => messages.value.length,
  () => {
    nextTick(() => {
      scrollToBottom();
    });
  }
);
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Chat Button -->
    <transition name="bounce">
      <button
        v-if="!isOpen"
        @click="toggleChat"
        class="bg-[#F79E0E] hover:bg-[#d96f00] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
        aria-label="Open chat"
      >
        <MessageCircle class="w-6 h-6" />
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
        >
          {{ unreadCount }}
        </span>
      </button>
    </transition>

    <!-- Chat Window -->
    <transition name="slide-up">
      <div
        v-if="isOpen"
        class="bg-white rounded-2xl shadow-2xl w-96 h-[600px] flex flex-col overflow-hidden border border-gray-200"
      >
        <!-- Header -->
        <div
          class="bg-[#F79E0E] text-white p-4 flex items-center justify-between"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              <Headphones class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-semibold">Live Chat Support</h3>
              <p class="text-xs text-white/80 flex items-center">
                <span
                  :class="[
                    'w-2 h-2 rounded-full mr-2',
                    isConnected ? 'bg-green-400' : 'bg-red-400',
                  ]"
                ></span>
                {{ connectionStatus }}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="toggleChat"
              class="hover:bg-white/20 p-2 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
        >
          <!-- Loading History -->
          <div
            v-if="isLoadingHistory"
            class="flex items-center justify-center py-8"
          >
            <div class="text-center">
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F79E0E] mx-auto mb-2"
              ></div>
              <p class="text-sm text-gray-600">Loading chat history...</p>
            </div>
          </div>

          <!-- Messages -->
          <div v-else>
            <div
              v-for="message in messages"
              :key="message.id"
              :class="[
                'flex',
                message.isUser ? 'justify-end' : 'justify-start',
              ]"
            >
              <div
                :class="[
                  'max-w-[75%] rounded-2xl p-3 shadow-sm',
                  message.isUser
                    ? 'bg-[#F79E0E] text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none',
                ]"
              >
                <p class="text-sm leading-relaxed">{{ message.text }}</p>
                <span
                  :class="[
                    'text-xs mt-1 block',
                    message.isUser ? 'text-white/80' : 'text-gray-500',
                  ]"
                >
                  {{ formatTime(message.timestamp) }}
                </span>
              </div>
            </div>

            <!-- Connection Error -->
            <div
              v-if="connectionError"
              class="text-center py-4 bg-red-50 rounded-lg"
            >
              <p class="text-sm text-red-600">{{ connectionError }}</p>
              <button
                @click="reconnect"
                class="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-full transition-colors"
              >
                Reconnect
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Replies -->
        <div
          v-if="
            showQuickReplies && quickReplies.length > 0 && !isLoadingHistory
          "
          class="px-4 py-2 bg-white border-t border-gray-200"
        >
          <p class="text-xs text-gray-600 mb-2">Quick replies:</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="reply in quickReplies"
              :key="reply"
              @click="sendQuickReply(reply)"
              class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
            >
              {{ reply }}
            </button>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 bg-white border-t border-gray-200">
          <form
            @submit.prevent="sendMessage"
            class="flex items-center space-x-2"
          >
            <button
              type="button"
              @click="showQuickReplies = !showQuickReplies"
              class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Quick replies"
              :disabled="isLoadingHistory"
            >
              <Sparkles class="w-5 h-5" />
            </button>

            <input
              v-model="newMessage"
              type="text"
              placeholder="Ketik pesan..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#F79E0E]/20 focus:border-[#F79E0E] outline-none text-sm"
              :disabled="isSending || !isConnected || isLoadingHistory"
            />

            <button
              type="submit"
              :disabled="
                !newMessage.trim() ||
                isSending ||
                !isConnected ||
                isLoadingHistory
              "
              class="bg-[#F79E0E] hover:bg-[#d96f00] text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Send message"
            >
              <Send class="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Animations */
.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-out 0.3s;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes bounce-out {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}

.slide-up-enter-active {
  animation: slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-leave-active {
  animation: slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slide-up {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slide-down {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>
