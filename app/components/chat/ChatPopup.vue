<template>
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Debug Toggle Button -->
    <button
      v-if="!isOpen"
      @click="showDebug = !showDebug"
      class="absolute -top-12 right-0 bg-gray-900 text-white p-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors mb-2"
      title="Toggle Debug Panel"
    >
      <Bug class="w-4 h-4" />
    </button>

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
              @click="showDebug = !showDebug"
              class="hover:bg-white/20 p-2 rounded-lg transition-colors"
              title="Toggle Debug"
            >
              <Bug class="w-4 h-4" />
            </button>
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

            <!-- Typing Indicator -->
            <div v-if="isTyping" class="flex justify-start">
              <div class="bg-white rounded-2xl rounded-bl-none p-3 shadow-sm">
                <div class="flex space-x-2">
                  <div
                    class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style="animation-delay: 0ms"
                  ></div>
                  <div
                    class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style="animation-delay: 150ms"
                  ></div>
                  <div
                    class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style="animation-delay: 300ms"
                  ></div>
                </div>
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

    <!-- Debug Panel -->
    <ChatDebugPanel
      :show-debug="showDebug"
      :logs="debugLogs"
      :is-connected="isConnected"
      :is-authenticated="isAuthenticated"
      @close="showDebug = false"
      @clear-logs="clearDebugLogs"
      @export-logs="exportDebugLogs"
    />
  </div>
</template>

<script setup lang="ts">
// filepath: app/components/chat/ChatPopup.vue
import { ref, nextTick, watch, onMounted, onUnmounted, computed } from "vue";
import {
  MessageCircle,
  X,
  Send,
  Headphones,
  Sparkles,
  Bug,
} from "lucide-vue-next";
import { useChatWebSocket } from "~/composables/useChatWebSocket";
import ChatDebugPanel from "./ChatDebugPanel.vue";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sender_type?: string;
  sender_id?: string | number;
  isOptimistic?: boolean; // Track if message is pending confirmation
}

const isOpen = ref(false);
const newMessage = ref("");
const messages = ref<Message[]>([]);
const messagesContainer = ref<HTMLElement | null>(null);
const isTyping = ref(false);
const isSending = ref(false);
const unreadCount = ref(0);
const showQuickReplies = ref(false);
const showDebug = ref(false);
const isLoadingHistory = ref(false);

const quickReplies = [
  "Halo, saya butuh bantuan",
  "Status pesanan saya?",
  "Cara refund?",
  "Masalah pembayaran",
];

// WebSocket composable with debug capabilities
const config = useRuntimeConfig();
const wsUrl = `${config.public.wsBase}/api/ws`;

const {
  isConnected,
  isAuthenticated,
  connectionError,
  debugLogs,
  connect,
  disconnect,
  sendChatMessage,
  onMessage,
  reconnect,
  clearDebugLogs,
  exportDebugLogs,
} = useChatWebSocket(wsUrl);

// Store the user ID from WebSocket connection
const currentUserId = ref<string | null>(null);

const connectionStatus = computed(() => {
  if (isConnected.value && isAuthenticated.value) return "Admin Online";
  if (isConnected.value && !isAuthenticated.value) return "Authenticating...";
  if (connectionError.value) return "Disconnected";
  return "Connecting...";
});

const conversationId = ref<string | null>(null);

// ⭐ NEW: Track recently sent message texts to avoid duplicates from broadcast
const recentlySentMessages = ref<Set<string>>(new Set());

// Helper function to determine if message is from current user
const isMessageFromCurrentUser = (msg: any): boolean => {
  if (msg.sender_id && currentUserId.value) {
    const isCurrentUser = msg.sender_id.toString() === currentUserId.value;
    return isCurrentUser;
  }
  return msg.sender_type === "customer" || msg.sender_type === "user";
};

// Helper function to check if message already exists
const messageExists = (messageId: number | string): boolean => {
  return messages.value.some(
    (msg) => msg.id.toString() === messageId.toString()
  );
};

// ⭐ NEW: Helper function to check if message text was recently sent
const isRecentlySentMessage = (
  text: string,
  senderId: string | number
): boolean => {
  // Only check for recently sent messages from current user
  if (
    senderId &&
    currentUserId.value &&
    senderId.toString() === currentUserId.value
  ) {
    return recentlySentMessages.value.has(text.trim());
  }
  return false;
};

// ⭐ NEW: Helper function to replace optimistic message with real one
const replaceOptimisticMessage = (text: string, realMessage: Message) => {
  const optimisticIndex = messages.value.findIndex(
    (msg) => msg.isOptimistic && msg.text.trim() === text.trim()
  );

  if (optimisticIndex !== -1) {
    console.log("Replacing optimistic message with real message", {
      optimisticId: messages.value[optimisticIndex].id,
      realId: realMessage.id,
    });

    // Replace the optimistic message with the real one
    messages.value[optimisticIndex] = {
      ...realMessage,
      isOptimistic: false,
    };

    // Remove from recently sent after a delay
    setTimeout(() => {
      recentlySentMessages.value.delete(text.trim());
    }, 2000);
  }
};

// Helper function to add message with deduplication
const addMessage = (newMsg: Message, playSound = false) => {
  // ⭐ NEW: Check if this is a message from current user that was recently sent
  if (
    newMsg.sender_id &&
    currentUserId.value &&
    newMsg.sender_id.toString() === currentUserId.value
  ) {
    // Check if we recently sent this exact message
    if (isRecentlySentMessage(newMsg.text, newMsg.sender_id)) {
      console.log(
        "Skipping duplicate message from current user (broadcast echo):",
        {
          text: newMsg.text.substring(0, 50),
          sender_id: newMsg.sender_id,
          messageId: newMsg.id,
        }
      );

      // Replace optimistic message with real one
      replaceOptimisticMessage(newMsg.text, newMsg);

      return;
    }
  }

  // Check if message already exists by ID
  if (messageExists(newMsg.id)) {
    console.log("Message already exists by ID, skipping:", newMsg.id);
    return;
  }

  // Add message to array
  messages.value.push(newMsg);

  console.log("Message added to UI:", {
    id: newMsg.id,
    sender_id: newMsg.sender_id,
    isUser: newMsg.isUser,
    text: newMsg.text.substring(0, 50),
    isOptimistic: newMsg.isOptimistic || false,
  });

  // Update unread count if chat is closed and message is not from user
  if (!isOpen.value && !newMsg.isUser) {
    unreadCount.value++;
  }

  // Scroll to bottom
  nextTick(() => {
    scrollToBottom();
  });

  // Optional: Play notification sound for incoming messages
  if (playSound && !newMsg.isUser && !newMsg.isOptimistic) {
    playNotificationSound();
  }
};

// Optional notification sound
const playNotificationSound = () => {
  try {
    const audio = new Audio("/sounds/notification.mp3");
    audio.volume = 0.5;
    audio.play().catch((err) => console.log("Could not play sound:", err));
  } catch (err) {
    console.log("Notification sound not available");
  }
};

// Initialize with welcome message
onMounted(() => {
  // Handle incoming messages
  onMessage((data) => {
    console.log("ChatPopup received message:", data);

    // Handle successful connection - CAPTURE USER ID HERE
    if (data.type === "connected") {
      console.log("Connected to WebSocket:", data);

      const userId =
        data.user_id || data.payload?.user_id || data.fullData?.user_id;

      if (userId) {
        currentUserId.value = userId.toString();
        console.log(
          "User ID set from WebSocket connection:",
          currentUserId.value
        );
        localStorage.setItem("chat_user_id", currentUserId.value);
      }
    }

    // Handle conversation loaded
    else if (data.type === "conversation_loaded") {
      const convId = data.conversation_id;
      conversationId.value = convId ? String(convId) : null;

      console.log("Conversation loaded:", {
        conversationId: conversationId.value,
        status: data.status,
      });

      if (conversationId.value) {
        localStorage.setItem("active_conversation_id", conversationId.value);
      }

      isLoadingHistory.value = true;
    }

    // Handle message history
    else if (data.type === "message_history") {
      isLoadingHistory.value = false;

      const historyMessages = data.messages || [];

      console.log(`Loading ${historyMessages.length} messages from history`);

      messages.value = [];
      recentlySentMessages.value.clear(); // ⭐ Clear recently sent on history load

      if (historyMessages.length > 0) {
        historyMessages.forEach((msg: any) => {
          const message: Message = {
            id: msg.id || Date.now() + Math.random(),
            text: msg.message_text || msg.text || msg.message || "",
            isUser:
              msg.sender_id && currentUserId.value
                ? msg.sender_id.toString() === currentUserId.value
                : false,
            timestamp: msg.created_at ? new Date(msg.created_at) : new Date(),
            sender_id: msg.sender_id,
            sender_type: msg.sender_type,
            isOptimistic: false,
          };

          messages.value.push(message);
        });

        console.log(`Loaded ${messages.value.length} messages from history`);

        nextTick(() => {
          scrollToBottom();
        });
      }
    }

    // Handle conversation creation
    else if (data.type === "conversation_created") {
      const convId = data.payload?.conversation_id || data.conversation_id;
      conversationId.value = convId ? String(convId) : null;

      console.log("Conversation created and stored:", conversationId.value);

      if (conversationId.value) {
        localStorage.setItem("active_conversation_id", conversationId.value);
      }

      if (
        messages.value.length === 0 ||
        messages.value.every((m) => !m.isUser)
      ) {
        addMessage({
          id: Date.now(),
          text: "Percakapan dimulai. Admin akan segera membalas pesan Anda.",
          isUser: false,
          timestamp: new Date(),
          isOptimistic: false,
        });
      }
    }

    // Handle incoming chat messages with type
    else if (data.type === "message" || data.type === "new_message") {
      const messageData = data.payload || data;

      const newMsg: Message = {
        id: messageData.id || Date.now(),
        text:
          messageData.message_text ||
          messageData.text ||
          messageData.message ||
          "",
        isUser:
          messageData.sender_id && currentUserId.value
            ? messageData.sender_id.toString() === currentUserId.value
            : false,
        timestamp: messageData.created_at
          ? new Date(messageData.created_at)
          : new Date(),
        sender_id: messageData.sender_id,
        sender_type: messageData.sender_type,
        isOptimistic: false,
      };

      addMessage(newMsg, true);
    }

    // Handle raw message objects from server (without type field)
    else if (
      data.id &&
      data.conversation_id &&
      data.message_text &&
      !data.type
    ) {
      console.log("Received raw message from server:", data);

      const newMsg: Message = {
        id: data.id,
        text: data.message_text,
        isUser:
          data.sender_id && currentUserId.value
            ? data.sender_id.toString() === currentUserId.value
            : false,
        timestamp: data.created_at ? new Date(data.created_at) : new Date(),
        sender_id: data.sender_id,
        isOptimistic: false,
      };

      console.log("Processing raw message:", {
        id: newMsg.id,
        sender_id: data.sender_id,
        current_user_id: currentUserId.value,
        isUser: newMsg.isUser,
        text: newMsg.text,
      });

      addMessage(newMsg, true);
    }

    // Handle typing indicator
    else if (data.type === "typing") {
      isTyping.value = data.payload?.is_typing || data.isTyping || false;

      if (isTyping.value) {
        nextTick(() => scrollToBottom());
      }
    }

    // Handle conversation status updates
    else if (data.type === "conversation_status") {
      const status = data.payload?.status || data.status;
      console.log("Conversation status updated:", status);

      if (status === "closed") {
        addMessage({
          id: Date.now(),
          text: "Percakapan ini telah ditutup oleh admin.",
          isUser: false,
          timestamp: new Date(),
          isOptimistic: false,
        });

        conversationId.value = null;
        localStorage.removeItem("active_conversation_id");
      }
    }

    // Handle error messages
    else if (data.type === "error") {
      console.error("WebSocket error:", data);

      addMessage({
        id: Date.now(),
        text: `Error: ${data.message || "Terjadi kesalahan pada koneksi"}`,
        isUser: false,
        timestamp: new Date(),
        isOptimistic: false,
      });
    }

    // Log unhandled message types
    else {
      console.warn("Unhandled WebSocket message type:", {
        type: data.type,
        hasId: !!data.id,
        hasConversationId: !!data.conversation_id,
        hasMessageText: !!data.message_text,
        fullData: data,
      });
    }
  });

  // Try to restore user ID and conversation ID from localStorage
  const savedUserId = localStorage.getItem("chat_user_id");
  if (savedUserId) {
    currentUserId.value = savedUserId;
    console.log("Restored user ID from localStorage:", savedUserId);
  }

  const savedConvId = localStorage.getItem("active_conversation_id");
  if (savedConvId) {
    conversationId.value = savedConvId;
    console.log("Restored conversation ID from localStorage:", savedConvId);
  }

  // Show initial welcome message (will be replaced if history loads)
  if (messages.value.length === 0) {
    messages.value.push({
      id: Date.now(),
      text: "Halo! 👋 Selamat datang di SecondCycle Help Center. Ada yang bisa kami bantu?",
      isUser: false,
      timestamp: new Date(),
      isOptimistic: false,
    });
    unreadCount.value = 1;
  }
});

onUnmounted(() => {
  disconnect();
});

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    unreadCount.value = 0;
    showQuickReplies.value = true;

    // Connect to WebSocket when chat opens
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

  // ⭐ NEW: Add to recently sent messages set
  recentlySentMessages.value.add(messageText);

  // Optimistically add user message to UI immediately
  const userMessage: Message = {
    id: tempId,
    text: messageText,
    isUser: true,
    timestamp: new Date(),
    sender_id: currentUserId.value,
    isOptimistic: true, // ⭐ Mark as optimistic
  };

  messages.value.push(userMessage);
  newMessage.value = "";
  showQuickReplies.value = false;
  isSending.value = true;

  await nextTick();
  scrollToBottom();

  try {
    // Send message via WebSocket
    await sendChatMessage(messageText, conversationId.value || undefined);

    console.log("Message sent successfully", {
      conversationId: conversationId.value,
      messageText: messageText.substring(0, 30) + "...",
    });

    isSending.value = false;

    // The server will send back the message with the real ID via WebSocket
    // Our addMessage function will handle replacing the optimistic message
  } catch (error) {
    console.error("Error sending message:", error);
    isSending.value = false;

    // ⭐ Remove from recently sent
    recentlySentMessages.value.delete(messageText);

    // Remove the optimistic message
    const msgIndex = messages.value.findIndex((m) => m.id === tempId);
    if (msgIndex !== -1) {
      messages.value.splice(msgIndex, 1);
    }

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

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Watch for new messages to auto-scroll
watch(
  () => messages.value.length,
  () => {
    nextTick(() => {
      scrollToBottom();
    });
  }
);

// Watch connection status
watch(isConnected, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    console.log("WebSocket reconnected");
  }
});
</script>

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
