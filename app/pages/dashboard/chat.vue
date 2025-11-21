<script setup lang="ts">
// filepath: app/pages/dashboard/chat.vue
import { ref, nextTick, onMounted, onUnmounted, watch } from "vue";
import { User, MessageCircle, Paperclip, Send } from "lucide-vue-next";
import { getWebsocket } from "~/composables/useWebsocket";
import { formatTimeToString } from "~/utils/formatTime";
import { useMessage } from "~/composables/useMessage";
import { useConversation } from "~/composables/useConversation";
import { useNotification } from "~/composables/useNotification";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

const config = useRuntimeConfig();
const newMessage = ref("");
const isSending = ref(false);
const isLoadingHistory = ref(false);
const isLoadingConversation = ref(false);

// add a reactive conversations list used by the template
const conversations = ref<any[]>([]);
const {
  messages,
  recentlySentMessages,
  isMessageFromCurrentUser,
  messagesContainer,
  handleWebSocketMessage,
  initializeFromStorage,
  scrollToBottom,
  fetchMessagesHistory,
  createOptimisticMessage,
  conversationId,
} = useMessage();

const { notification } = useNotification();

// helper to apply notification unread counts to conversation objects
const applyNotificationsToConversations = (convs: any[]) => {
  const notifs = Array.isArray(notification.value) ? notification.value : [];
  return convs.map((c) => {
    const match = notifs.find((n: any) => n.conversationId === c.id);
    return {
      ...c,
      unreadCount: match ? match.unreadCount : c.unreadCount ?? 0,
    };
  });
};

// keep conversations in sync when notifications update
watch(
  notification,
  () => {
    if (conversations.value && conversations.value.length > 0) {
      conversations.value = applyNotificationsToConversations(
        conversations.value
      );
    }
  },
  { immediate: false }
);

// WebSocket setup
const wsUrl = `${config.public.wsBase}/api/ws`;
const {
  isConnected,
  Message,
  onMessage,
  connectionError,
  subscribe,
  unsubscribe,
} = getWebsocket(wsUrl);
const {
  fetchConversation,
  selectConversation,
  selectedConversation,
  closeConversation,
} = useConversation();

// Send message handler
const sendAdminMessage = async () => {
  if (!newMessage.value.trim() || isSending.value) return;

  const messageText = newMessage.value.trim();

  // Track recently sent
  recentlySentMessages.value.add(messageText);

  const adminMessage = createOptimisticMessage(
    messageText,
    selectedConversation.value!.id
  );
  messages.value.push(adminMessage);

  isSending.value = true;

  try {
    newMessage.value = "";

    nextTick(() => scrollToBottom());

    // Send via WebSocket
    await Message(messageText, selectedConversation.value!.id);

    console.log("Message sent successfully", {});

    isSending.value = false;
  } catch (err) {
    console.error("Error sending message:", err);

    // Remove from recently sent
    recentlySentMessages.value.delete(messageText);
  }
};

// Load conversation history when selecting a conversation
const loadConversationHistory = async (conversation: any) => {
  // If switching from another selected conversation, unsubscribe it first
  if (
    selectedConversation.value &&
    selectedConversation.value.id !== conversation.id
  ) {
    try {
      unsubscribe(selectedConversation.value.id);
    } catch (err) {
      console.error("Error unsubscribing previous conversation:", err);
    }
  }

  // select the new conversation and clear messages
  selectConversation(conversation);
  messages.value = [];

  // Ensure useMessage knows the active conversation id so fetchMessagesHistory works
  conversationId.value = conversation.id;
  localStorage.setItem("conversation_id", String(conversation.id));

  // Subscribe to conversation
  try {
    subscribe(conversation.id);
  } catch (err) {
    console.error("Error subscribing to conversation:", err);
  }

  // Load message history
  isLoadingHistory.value = true;
  try {
    const result = await fetchMessagesHistory({ limit: 50 });
    messages.value = result.messages;

    nextTick(() => scrollToBottom());
  } catch (err) {
    console.error("Error loading messages:", err);
  } finally {
    isLoadingHistory.value = false;
  }
};

// Handle incoming WebSocket messages
onMessage((data) => {
  handleWebSocketMessage(data);
  nextTick(() => scrollToBottom());
});

onMounted(async () => {
  // Initialize from localStorage
  initializeFromStorage();

  // Connection is handled by dashboard layout singleton
  isLoadingConversation.value = true;
  try {
    const resp = await fetchConversation();
    if (resp) {
      // merge unread counts from notifications into each conversation
      conversations.value = applyNotificationsToConversations(resp);
      // auto-select first conversation if none selected
      if (!selectedConversation.value && conversations.value.length > 0) {
        await loadConversationHistory(conversations.value[0]);
      }
    } else {
      console.warn("fetchConversation returned no conversations", resp);
    }
  } catch (err) {
    console.error("Failed to fetch conversations", err);
  } finally {
    isLoadingConversation.value = false;
  }
});

onUnmounted(() => {
  // no-op: connection lifecycle is managed by the dashboard layout singleton
});

// Close selected conversation (admin)
const closeSelectedConversation = async () => {
  if (!selectedConversation.value) return;
  isLoadingConversation.value = true;

  try {
    // Unsubscribe websocket for this conversation to stop receiving messages
    try {
      unsubscribe(selectedConversation.value.id);
    } catch (e) {
      console.warn("unsubscribe failed", e);
    }

    // Call API to close conversation
    const resp = await closeConversation(selectedConversation.value.id);

    // If API returns updated conversation object, apply it
    if (resp && (resp.data as any)) {
      // update selectedConversation
      selectedConversation.value = resp.data as any;

      // update conversation list status (if present)
      const idx = conversations.value.findIndex(
        (c) => c.id === (resp.data as any).id
      );
      if (idx !== -1) {
        conversations.value[idx] = {
          ...(conversations.value[idx] || {}),
          ...(resp.data as any),
        };
      }
    } else {
      // fallback: mark locally as closed
      (selectedConversation.value as any).status = "closed";
      const idx = conversations.value.findIndex(
        (c) => c.id === selectedConversation.value!.id
      );
      if (idx !== -1) conversations.value[idx].status = "closed";
    }

    // Clear message state and conversation id so UI reflects closed conversation
    messages.value = [];
    conversationId.value = undefined;
    localStorage.removeItem("conversation_id");
  } catch (err) {
    console.error("Failed to close conversation:", err);
  } finally {
    isLoadingConversation.value = false;
  }
};
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
    <div
      v-if="isLoadingConversation"
      class="flex items-center justify-center h-96"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F79E0E] mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Loading conversations...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="connectionError"
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
          <p class="text-sm text-red-600">{{ connectionError }}</p>
        </div>
        <button
          @click="fetchConversation"
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
              <h3 class="font-semibold text-gray-800">Total Chat</h3>
              <p class="text-sm text-gray-600">
                {{ conversations.length }} conversations
              </p>
            </div>
            <button
              @click="fetchConversation"
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
            v-for="conversation in conversations"
            :key="conversation.id"
            @click="loadConversationHistory(conversation)"
            :class="[
              'p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors',
              selectedConversation?.id === conversation.id
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
                  v-if="conversation.isOnline"
                  class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                ></div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-800 truncate">
                    {{ conversation.customerName }}
                  </p>
                  <span class="text-xs text-gray-500">
                    {{ formatTimeToString(conversation.lastMessageTime) }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 truncate mt-1">
                  {{ conversation.lastMessage }}
                </p>
                <div class="flex items-center justify-between mt-1">
                  <span
                    v-if="conversation.unreadCount > 0"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#F79E0E] text-white"
                  >
                    {{ conversation.unreadCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="conversations.length === 0" class="p-8 text-center">
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
          v-if="selectedConversation"
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
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-gray-800">
                    {{ selectedConversation.customerName }}
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
                  {{ selectedConversation.customerEmail }}
                </p>
              </div>
            </div>
            <!-- Close button -->
            <div class="ml-4">
              <button
                @click="closeSelectedConversation"
                :disabled="isLoadingConversation"
                class="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                title="Close conversation"
              >
                Close Conversation
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
            v-if="isLoadingHistory"
            class="flex items-center justify-center h-full"
          >
            <div class="text-center">
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F79E0E] mx-auto mb-2"
              ></div>
              <p class="text-sm text-gray-600">Memuat riwayat chat...</p>
            </div>
          </div>

          <!-- Messages -->
          <div
            v-else-if="selectedConversation && messages.length > 0"
            class="space-y-4"
          >
            <div
              v-for="message in messages"
              :key="message.id"
              :class="[
                'flex',
                isMessageFromCurrentUser(message)
                  ? 'justify-end'
                  : 'justify-start',
              ]"
            >
              <div
                :class="[
                  'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                  isMessageFromCurrentUser(message)
                    ? 'bg-[#F79E0E] text-white'
                    : 'bg-gray-100 text-gray-800',
                ]"
              >
                <p class="text-sm">{{ message.text }}</p>
                <p
                  :class="[
                    'text-xs mt-1',
                    isMessageFromCurrentUser(message)
                      ? 'text-orange-100'
                      : 'text-gray-500',
                  ]"
                >
                  {{ formatTimeToDate(message.createdAt) }}
                </p>
              </div>
            </div>
          </div>

          <!-- No Chat Selected -->
          <div
            v-else-if="!selectedConversation"
            class="flex items-center justify-center h-full"
          >
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

          <!-- Empty Messages State -->
          <div v-else class="flex items-center justify-center h-full">
            <div class="text-center">
              <MessageCircle class="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-600">No messages yet in this conversation</p>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div v-if="selectedConversation" class="p-4 border-t border-gray-200">
          <form
            @submit.prevent="sendAdminMessage"
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
                @keydown.enter.prevent="sendAdminMessage"
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
      </div>
    </div>
  </div>
</template>
