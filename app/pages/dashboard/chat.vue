<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Customer Chat</h1>
      <p class="text-gray-600">Real-time conversations with customers</p>
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
                <h3 class="font-semibold text-gray-800">
                  {{ selectedChat.customerName }}
                </h3>
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
                message.sender === 'admin' || message.sender === 'agent'
                  ? 'justify-end'
                  : 'justify-start',
              ]"
            >
              <div
                :class="[
                  'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                  message.sender === 'admin' || message.sender === 'agent'
                    ? 'bg-[#F79E0E] text-white'
                    : 'bg-gray-100 text-gray-800',
                ]"
              >
                <p class="text-sm">{{ message.text || message.message }}</p>
                <p
                  :class="[
                    'text-xs mt-1',
                    message.sender === 'admin' || message.sender === 'agent'
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
                :disabled="isSending"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F79E0E]/20 focus:border-[#F79E0E] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                @keydown.enter.prevent="sendMessage"
              />
            </div>

            <button
              type="submit"
              :disabled="!newMessage.trim() || isSending"
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

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, computed } from "vue";
import {
  User,
  MessageCircle,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Send,
} from "lucide-vue-next";
import { useChatWebSocket } from "~/composables/useChatWebSocket";
import { useAuth } from "~/composables/useAuth";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

interface Message {
  id: string;
  text?: string;
  message?: string;
  sender: "customer" | "admin" | "agent";
  timestamp?: string;
  created_at?: string;
  sender_type?: string;
}

interface Chat {
  id: string;
  customer_id: string;
  agent_id?: string;
  status: "open" | "closed" | "pending";
  customerName: string;
  customerEmail: string;
  isOnline: boolean;
  lastSeen: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  created_at?: string;
  updated_at?: string;
}

const config = useRuntimeConfig();
const selectedChat = ref<Chat | null>(null);
const newMessage = ref("");
const messagesContainer = ref<HTMLElement | null>(null);
const activeChats = ref<Chat[]>([]);
const isLoading = ref(false);
const loadingMessages = ref(false);
const isSending = ref(false);
const error = ref("");

// WebSocket setup
const wsUrl = `${config.public.wsBase}/api/ws`;
const { isConnected, sendChatMessage, onMessage, connect, disconnect } =
  useChatWebSocket(wsUrl);

const { getToken } = useAuth();

// Fetch conversations from API
const fetchConversations = async () => {
  isLoading.value = true;
  error.value = "";

  try {
    const token = getToken();

    const response = await $fetch<{ data: any[] }>(
      `${config.public.apiBase}/api/conversations`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    console.log("Conversations response:", response);

    const conversations = response.data || response;

    activeChats.value = conversations.map((conv: any) => ({
      id: conv.id.toString(),
      customer_id: conv.customer_id?.toString() || conv.customerId?.toString(),
      agent_id: conv.agent_id?.toString() || conv.agentId?.toString(),
      status: conv.status || "open",
      customerName:
        conv.customer_name ||
        conv.customerName ||
        `Customer ${conv.customer_id}`,
      customerEmail: conv.customer_email || conv.customerEmail || "",
      isOnline: conv.is_online || conv.isOnline || false,
      lastSeen:
        conv.updated_at ||
        conv.updatedAt ||
        conv.created_at ||
        new Date().toISOString(),
      lastMessage: conv.last_message || conv.lastMessage || "No messages yet",
      lastMessageTime:
        conv.updated_at ||
        conv.updatedAt ||
        conv.created_at ||
        new Date().toISOString(),
      unreadCount: conv.unread_count || conv.unreadCount || 0,
      messages: [],
      created_at: conv.created_at || conv.createdAt,
      updated_at: conv.updated_at || conv.updatedAt,
    }));

    console.log("Processed conversations:", activeChats.value);
  } catch (err: any) {
    console.error("Error fetching conversations:", err);
    error.value = err.message || "Failed to load conversations";
  } finally {
    isLoading.value = false;
  }
};

// Fetch messages for a conversation
const fetchMessages = async (conversationId: string) => {
  loadingMessages.value = true;

  try {
    const token = getToken();

    const response = await $fetch<{ data: any[] }>(
      `${config.public.apiBase}/api/conversations/${conversationId}/messages`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    console.log("Messages response:", response);

    const messages = response.data || response;

    return messages.map((msg: any) => ({
      id: msg.id?.toString(),
      text: msg.message || msg.text,
      message: msg.message || msg.text,
      sender: msg.sender_type || msg.sender || "customer",
      sender_type: msg.sender_type || msg.sender,
      timestamp: msg.created_at || msg.timestamp,
      created_at: msg.created_at || msg.timestamp,
    }));
  } catch (err) {
    console.error("Error fetching messages:", err);
    return [];
  } finally {
    loadingMessages.value = false;
  }
};

const selectChat = async (chat: Chat) => {
  selectedChat.value = chat;
  chat.unreadCount = 0;

  // Fetch messages for this conversation
  const messages = await fetchMessages(chat.id);
  chat.messages = messages;

  nextTick(() => {
    scrollToBottom();
  });
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedChat.value || isSending.value)
    return;

  isSending.value = true;

  try {
    // Send via WebSocket
    await sendChatMessage(newMessage.value.trim(), selectedChat.value.id);

    // Optimistically add message to UI
    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.value.trim(),
      sender: "admin",
      timestamp: new Date().toISOString(),
    };

    selectedChat.value.messages.push(message);
    selectedChat.value.lastMessage = message.text || "";
    selectedChat.value.lastMessageTime = message.timestamp || "";

    newMessage.value = "";

    nextTick(() => {
      scrollToBottom();
    });
  } catch (err) {
    console.error("Error sending message:", err);
    error.value = "Failed to send message";
  } finally {
    isSending.value = false;
  }
};

const closeConversation = async () => {
  if (!selectedChat.value) return;

  try {
    const token = getToken();

    await $fetch(
      `${config.public.apiBase}/api/conversations/${selectedChat.value.id}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: { status: "closed" },
      }
    );

    selectedChat.value.status = "closed";

    // Refresh conversations list
    await fetchConversations();
  } catch (err) {
    console.error("Error closing conversation:", err);
    error.value = "Failed to close conversation";
  }
};

const reopenConversation = async () => {
  if (!selectedChat.value) return;

  try {
    const token = getToken();

    await $fetch(
      `${config.public.apiBase}/api/conversations/${selectedChat.value.id}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: { status: "open" },
      }
    );

    selectedChat.value.status = "open";

    // Refresh conversations list
    await fetchConversations();
  } catch (err) {
    console.error("Error reopening conversation:", err);
    error.value = "Failed to reopen conversation";
  }
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const formatTime = (timestamp: string) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Handle incoming WebSocket messages
onMessage((data) => {
  console.log("WebSocket message received:", data);

  if (data.type === "new_message" || data.type === "message") {
    const message: Message = {
      id: data.payload?.id || Date.now().toString(),
      text: data.payload?.text || data.message,
      sender: data.payload?.sender_type || data.sender || "customer",
      timestamp:
        data.payload?.created_at || data.timestamp || new Date().toISOString(),
    };

    const conversationId =
      data.payload?.conversation_id || data.conversation_id;

    // Update the chat if it's currently selected
    if (selectedChat.value && selectedChat.value.id === conversationId) {
      selectedChat.value.messages.push(message);
      nextTick(() => scrollToBottom());
    }

    // Update the conversation in the list
    const chatIndex = activeChats.value.findIndex(
      (c) => c.id === conversationId
    );
    if (chatIndex !== -1) {
      activeChats.value[chatIndex].lastMessage = message.text || "";
      activeChats.value[chatIndex].lastMessageTime = message.timestamp || "";

      if (selectedChat.value?.id !== conversationId) {
        activeChats.value[chatIndex].unreadCount++;
      }
    }
  }
});

onMounted(async () => {
  // Connect to WebSocket
  connect();

  // Fetch initial conversations
  await fetchConversations();

  // Auto-select first chat if available
  if (activeChats.value.length > 0 && activeChats.value[0]) {
    await selectChat(activeChats.value[0]);
  }

  // Refresh conversations every 30 seconds
  const refreshInterval = setInterval(fetchConversations, 30000);

  onUnmounted(() => {
    clearInterval(refreshInterval);
    disconnect();
  });
});
</script>
