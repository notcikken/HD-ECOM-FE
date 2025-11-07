<script setup lang="ts">
// filepath: app/pages/dashboard/chat.vue
import { ref, nextTick, onMounted, onUnmounted, watch } from "vue";
import {
  User,
  MessageCircle,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Send,
} from "lucide-vue-next";
import { useWebsocket } from "~/composables/useWebsocket";
import { useAdminChat } from "~/composables/useAdminChat";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

const config = useRuntimeConfig();
const newMessage = ref("");
const isSending = ref(false);

// WebSocket setup
const wsUrl = `${config.public.wsBase}/api/ws`;
const { isConnected, sendChatMessage, onMessage, connect, disconnect } =
  useWebsocket(wsUrl);

// Admin chat management
const {
  activeChats,
  selectedChat,
  messagesContainer,
  currentAdminId,
  recentlySentMessages,
  isLoading,
  loadingMessages,
  error,
  isMessageFromCurrentAdmin,
  addMessageToChat,
  scrollToBottom,
  fetchConversations,
  selectChat,
  createOptimisticMessage,
  removeOptimisticMessage,
  handleWebSocketMessage,
  updateConversationStatus,
  formatTime,
  initializeFromStorage,
} = useAdminChat();

// Send message handler
const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedChat.value || isSending.value)
    return;

  const messageText = newMessage.value.trim();
  const tempId = Date.now().toString();

  // Track recently sent
  recentlySentMessages.value.add(messageText);
  isSending.value = true;

  try {
    // Create and add optimistic message
    const message = createOptimisticMessage(messageText, tempId);
    selectedChat.value.messages.push(message);
    selectedChat.value.lastMessage = message.text || "";
    selectedChat.value.lastMessageTime = message.timestamp || "";

    newMessage.value = "";

    nextTick(() => scrollToBottom());

    // Send via WebSocket
    await sendChatMessage(messageText, selectedChat.value.id);

    console.log("Message sent successfully", {
      conversationId: selectedChat.value.id,
      messageText: messageText.substring(0, 30) + "...",
    });

    isSending.value = false;
  } catch (err) {
    console.error("Error sending message:", err);
    error.value = "Failed to send message";
    isSending.value = false;

    // Remove from recently sent
    recentlySentMessages.value.delete(messageText);

    // Remove optimistic message
    if (selectedChat.value) {
      removeOptimisticMessage(selectedChat.value, tempId);

      // Add error message
      selectedChat.value.messages.push({
        id: Date.now().toString(),
        text: "Failed to send message. Please try again.",
        message: "Failed to send message. Please try again.",
        sender: "admin",
        timestamp: new Date().toISOString(),
        isOptimistic: false,
      });
    }
  }
};

const closeConversation = async () => {
  if (!selectedChat.value) return;

  try {
    await updateConversationStatus(selectedChat.value.id, "closed");
    selectedChat.value.status = "closed";
  } catch (err) {
    console.error("Error closing conversation:", err);
    error.value = "Failed to close conversation";
  }
};

const reopenConversation = async () => {
  if (!selectedChat.value) return;

  try {
    await updateConversationStatus(selectedChat.value.id, "open");
    selectedChat.value.status = "open";
  } catch (err) {
    console.error("Error reopening conversation:", err);
    error.value = "Failed to reopen conversation";
  }
};

// Handle incoming WebSocket messages
onMessage((data) => {
  handleWebSocketMessage(data);
});

onMounted(async () => {
  // Initialize from localStorage
  initializeFromStorage();

  // Connect to WebSocket
  connect();

  // Fetch initial conversations
  await fetchConversations();

  // Auto-select first chat if available
  if (activeChats.value.length > 0 && activeChats.value[0]) {
    await selectChat(activeChats.value[0]);
  }
});

onUnmounted(() => {
  disconnect();
});
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Customer Chat</h1>
        <p class="text-gray-600">Real-time conversations with customers</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center h-96">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F79E0E] mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Loading conversations...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6"
    >
      <div class="flex items-center space-x-3">
        <div class="text-red-500">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <div>
          <h3 class="font-semibold text-red-800">
            Error Loading Conversations
          </h3>
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
        <button
          @click="fetchConversations"
          class="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Chat Interface -->
    <div
      v-else
      class="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]"
    >
      <!-- Chat List Sidebar -->
      <div
        class="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-gray-800">Active Chats</h3>
              <p class="text-sm text-gray-600">
                {{ activeChats.length }} conversations
              </p>
            </div>
            <button
              @click="fetchConversations"
              class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh conversations"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="overflow-y-auto h-full">
          <div
            v-for="chat in activeChats"
            :key="chat.id"
            @click="selectChat(chat)"
            :class="[
              'p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors',
              selectedChat?.id === chat.id
                ? 'bg-[#F79E0E]/10 border-l-4 border-l-[#F79E0E]'
                : '',
            ]"
          >
            <div class="flex items-start space-x-3">
              <div class="relative">
                <div
                  class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center"
                >
                  <User class="w-5 h-5 text-gray-600" />
                </div>
                <div
                  v-if="chat.isOnline"
                  class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                ></div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-800 truncate">
                    {{ chat.customerName }}
                  </p>
                  <span class="text-xs text-gray-500">
                    {{ formatTime(chat.lastMessageTime) }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 truncate mt-1">
                  {{ chat.lastMessage }}
                </p>
                <div class="flex items-center justify-between mt-1">
                  <span
                    :class="[
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      chat.status === 'open'
                        ? 'bg-green-100 text-green-700'
                        : chat.status === 'closed'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-yellow-100 text-yellow-700',
                    ]"
                  >
                    {{ chat.status }}
                  </span>
                  <span
                    v-if="chat.unreadCount > 0"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#F79E0E] text-white"
                  >
                    {{ chat.unreadCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="activeChats.length === 0" class="p-8 text-center">
            <MessageCircle class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600">No active chats</p>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div
        class="lg:col-span-3 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col"
      >
        <!-- Chat Header -->
        <div
          v-if="selectedChat"
          class="p-4 border-b border-gray-200 bg-gray-50"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="relative">
                <div
                  class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center"
                >
                  <User class="w-5 h-5 text-gray-600" />
                </div>
                <div
                  v-if="selectedChat.isOnline"
                  class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                ></div>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-gray-800">
                    {{ selectedChat.customerName }}
                  </h3>
                  <!-- Connection Status Badge -->
                  <span
                    :class="[
                      'text-xs px-2 py-1 rounded-full flex items-center gap-1',
                      isConnected
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700',
                    ]"
                  >
                    <span
                      :class="[
                        'w-2 h-2 rounded-full',
                        isConnected ? 'bg-green-500' : 'bg-red-500',
                      ]"
                    ></span>
                    {{ isConnected ? "Connected" : "Disconnected" }}
                  </span>
                </div>
                <p class="text-sm text-gray-600">
                  {{ selectedChat.customerEmail }}
                </p>
                <p class="text-xs text-gray-500">
                  {{
                    selectedChat.isOnline
                      ? "Online"
                      : `Last seen ${formatTime(selectedChat.lastSeen)}`
                  }}
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <button
                v-if="selectedChat.status === 'open'"
                @click="closeConversation"
                class="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                Close Chat
              </button>
              <button
                class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Messages Area -->
        <div
          class="flex-1 overflow-y-auto p-4 space-y-4"
          ref="messagesContainer"
        >
          <!-- Loading Messages -->
          <div
            v-if="loadingMessages"
            class="flex items-center justify-center h-full"
          >
            <div class="text-center">
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F79E0E] mx-auto mb-2"
              ></div>
              <p class="text-sm text-gray-600">Loading messages...</p>
            </div>
          </div>

          <!-- Messages -->
          <div v-else-if="selectedChat" class="space-y-4">
            <div
              v-for="message in selectedChat.messages"
              :key="message.id"
              :class="[
                'flex',
                isMessageFromCurrentAdmin(message)
                  ? 'justify-end'
                  : 'justify-start',
              ]"
            >
              <div
                :class="[
                  'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                  isMessageFromCurrentAdmin(message)
                    ? 'bg-[#F79E0E] text-white'
                    : 'bg-gray-100 text-gray-800',
                ]"
              >
                <p class="text-sm">{{ message.text || message.message }}</p>
                <p
                  :class="[
                    'text-xs mt-1',
                    isMessageFromCurrentAdmin(message)
                      ? 'text-orange-100'
                      : 'text-gray-500',
                  ]"
                >
                  {{ formatTime(message.timestamp || message.created_at) }}
                </p>
              </div>
            </div>
          </div>

          <!-- No Chat Selected -->
          <div v-else class="flex items-center justify-center h-full">
            <div class="text-center">
              <MessageCircle class="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-gray-800 mb-2">
                Select a chat to start messaging
              </h3>
              <p class="text-gray-600">
                Choose a conversation from the sidebar to view messages
              </p>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div
          v-if="selectedChat && selectedChat.status === 'open'"
          class="p-4 border-t border-gray-200"
        >
          <form
            @submit.prevent="sendMessage"
            class="flex items-center space-x-3"
          >
            <button
              type="button"
              class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Paperclip class="w-5 h-5" />
            </button>

            <div class="flex-1 relative">
              <input
                v-model="newMessage"
                type="text"
                placeholder="Type your message..."
                :disabled="isSending || !isConnected"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F79E0E]/20 focus:border-[#F79E0E] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                @keydown.enter.prevent="sendMessage"
              />
            </div>

            <button
              type="submit"
              :disabled="!newMessage.trim() || isSending || !isConnected"
              class="p-3 bg-[#F79E0E] text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send v-if="!isSending" class="w-5 h-5" />
              <div
                v-else
                class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></div>
            </button>
          </form>
        </div>

        <!-- Closed Chat Notice -->
        <div
          v-else-if="selectedChat && selectedChat.status === 'closed'"
          class="p-4 border-t border-gray-200 bg-gray-50"
        >
          <p class="text-sm text-gray-600 text-center">
            This conversation is closed.
            <button
              @click="reopenConversation"
              class="text-[#F79E0E] hover:underline font-medium"
            >
              Reopen conversation
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
