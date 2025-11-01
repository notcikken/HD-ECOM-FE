<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Customer Chat</h1>
        <p class="text-gray-600">Real-time conversations with customers</p>
      </div>

      <!-- Debug Toggle Button -->
      <button
        @click="showDebug = !showDebug"
        class="bg-gray-900 text-white p-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
        title="Toggle Debug Panel"
      >
        <Bug class="w-5 h-5" />
      </button>
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
  Bug,
} from "lucide-vue-next";
import { useChatWebSocket } from "~/composables/useChatWebSocket";
import { useAuth } from "~/composables/useAuth";
import ChatDebugPanel from "~/components/chat/ChatDebugPanel.vue";

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
  sender_id?: string | number;
  isOptimistic?: boolean;
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
const showDebug = ref(false);

// WebSocket setup
const wsUrl = `${config.public.wsBase}/api/ws`;
const {
  isConnected,
  isAuthenticated,
  debugLogs,
  sendChatMessage,
  onMessage,
  connect,
  disconnect,
  clearDebugLogs,
  exportDebugLogs,
} = useChatWebSocket(wsUrl);

const { getToken } = useAuth();

// Store admin user ID from WebSocket
const currentAdminId = ref<string | null>(null);

// Track recently sent message texts to avoid duplicates
const recentlySentMessages = ref<Set<string>>(new Set());

// Helper function to check if message is from current admin
const isMessageFromCurrentAdmin = (msg: Message): boolean => {
  if (msg.sender_id && currentAdminId.value) {
    return msg.sender_id.toString() === currentAdminId.value;
  }
  // Fallback to sender type
  return (
    msg.sender === "admin" ||
    msg.sender === "agent" ||
    msg.sender_type === "admin" ||
    msg.sender_type === "agent"
  );
};

// Helper function to check if message already exists
const messageExists = (chat: Chat, messageId: string): boolean => {
  return chat.messages.some(
    (msg) => msg.id.toString() === messageId.toString()
  );
};

// Helper function to check if message text was recently sent
const isRecentlySentMessage = (
  text: string,
  senderId: string | number
): boolean => {
  // Only check for recently sent messages from current admin
  if (senderId && senderId.toString() === currentAdminId.value) {
    return recentlySentMessages.value.has(text.trim());
  }
  return false;
};

// Helper function to replace optimistic message with real one
const replaceOptimisticMessage = (
  chat: Chat,
  text: string,
  realMessage: Message
) => {
  const optimisticIndex = chat.messages.findIndex(
    (msg) => msg.isOptimistic && msg.text?.trim() === text.trim()
  );

  if (optimisticIndex !== -1) {
    console.log("Replacing optimistic message with real message", {
      optimisticId: chat.messages[optimisticIndex].id,
      realId: realMessage.id,
      chatId: chat.id,
    });

    // Replace the optimistic message with the real one
    chat.messages[optimisticIndex] = {
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
const addMessageToChat = (chat: Chat, newMsg: Message) => {
  // Check if this is a message from current admin that was recently sent
  if (
    newMsg.sender_id &&
    currentAdminId.value &&
    newMsg.sender_id.toString() === currentAdminId.value
  ) {
    // Check if we recently sent this exact message
    if (
      isRecentlySentMessage(
        newMsg.text || newMsg.message || "",
        newMsg.sender_id
      )
    ) {
      console.log(
        "Skipping duplicate message from current admin (broadcast echo):",
        {
          text: (newMsg.text || newMsg.message || "").substring(0, 50),
          sender_id: newMsg.sender_id,
          chatId: chat.id,
          messageId: newMsg.id,
        }
      );

      // Replace optimistic message with real one
      replaceOptimisticMessage(
        chat,
        newMsg.text || newMsg.message || "",
        newMsg
      );

      return;
    }
  }

  // Check if message already exists by ID
  if (messageExists(chat, newMsg.id)) {
    console.log("Message already exists in chat by ID, skipping:", {
      messageId: newMsg.id,
      chatId: chat.id,
    });
    return;
  }

  // Add message to chat
  chat.messages.push(newMsg);

  console.log("Message added to chat:", {
    messageId: newMsg.id,
    sender_id: newMsg.sender_id,
    isFromAdmin: isMessageFromCurrentAdmin(newMsg),
    text: (newMsg.text || newMsg.message || "").substring(0, 50),
    isOptimistic: newMsg.isOptimistic || false,
    chatId: chat.id,
  });

  // Auto-scroll if this is the selected chat
  if (selectedChat.value?.id === chat.id) {
    nextTick(() => scrollToBottom());
  }
};

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
      text: msg.message || msg.text || msg.message_text,
      message: msg.message || msg.text || msg.message_text,
      sender: msg.sender_type || msg.sender || "customer",
      sender_type: msg.sender_type || msg.sender,
      sender_id: msg.sender_id,
      timestamp: msg.created_at || msg.timestamp,
      created_at: msg.created_at || msg.timestamp,
      isOptimistic: false,
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

  // Clear recently sent messages when switching chats
  recentlySentMessages.value.clear();

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

  const messageText = newMessage.value.trim();
  const tempId = Date.now().toString();

  // Add to recently sent messages set
  recentlySentMessages.value.add(messageText);

  isSending.value = true;

  try {
    // Optimistically add message to UI immediately
    const message: Message = {
      id: tempId,
      text: messageText,
      message: messageText,
      sender: "admin",
      sender_type: "admin",
      sender_id: currentAdminId.value,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      isOptimistic: true, // Mark as optimistic
    };

    selectedChat.value.messages.push(message);
    selectedChat.value.lastMessage = message.text || "";
    selectedChat.value.lastMessageTime = message.timestamp || "";

    newMessage.value = "";

    nextTick(() => {
      scrollToBottom();
    });

    // Send via WebSocket
    await sendChatMessage(messageText, selectedChat.value.id);

    console.log("Message sent successfully", {
      conversationId: selectedChat.value.id,
      messageText: messageText.substring(0, 30) + "...",
    });

    isSending.value = false;

    // The server will send back the message with the real ID via WebSocket
    // Our addMessageToChat function will handle replacing the optimistic message
  } catch (err) {
    console.error("Error sending message:", err);
    error.value = "Failed to send message";
    isSending.value = false;

    // Remove from recently sent
    recentlySentMessages.value.delete(messageText);

    // Remove the optimistic message
    if (selectedChat.value) {
      const msgIndex = selectedChat.value.messages.findIndex(
        (m) => m.id === tempId
      );
      if (msgIndex !== -1) {
        selectedChat.value.messages.splice(msgIndex, 1);
      }
    }

    // Add error message
    if (selectedChat.value) {
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

  // Capture admin user ID from connection
  if (data.type === "connected") {
    const userId =
      data.user_id || data.payload?.user_id || data.fullData?.user_id;

    if (userId) {
      currentAdminId.value = userId.toString();
      console.log("Admin user ID set from WebSocket:", currentAdminId.value);
      localStorage.setItem("admin_user_id", currentAdminId.value);
    }
  }

  // Handle new conversation creation (from customer)
  else if (data.type === "conversation_created") {
    const newConversation = data.payload;

    if (newConversation) {
      // Add to active chats if not already present
      const exists = activeChats.value.find(
        (c) => c.id === String(newConversation.id)
      );

      if (!exists) {
        const chat: Chat = {
          id: String(newConversation.id),
          customer_id: String(newConversation.customer_id),
          agent_id: newConversation.agent_id
            ? String(newConversation.agent_id)
            : undefined,
          status: newConversation.status || "open",
          customerName:
            newConversation.customer_name ||
            `Customer ${newConversation.customer_id}`,
          customerEmail: newConversation.customer_email || "",
          isOnline: true,
          lastSeen: new Date().toISOString(),
          lastMessage: "New conversation started",
          lastMessageTime: new Date().toISOString(),
          unreadCount: 1,
          messages: [],
          created_at: newConversation.created_at || new Date().toISOString(),
          updated_at: newConversation.updated_at || new Date().toISOString(),
        };

        // Add to the beginning of the list
        activeChats.value.unshift(chat);

        console.log("New conversation added to list:", chat);
      }
    }
  }

  // Handle incoming chat messages with type
  else if (data.type === "new_message" || data.type === "message") {
    const messageData = data.payload || data;

    const message: Message = {
      id: messageData.id?.toString() || Date.now().toString(),
      text: messageData.text || messageData.message || messageData.message_text,
      message:
        messageData.text || messageData.message || messageData.message_text,
      sender: messageData.sender_type || messageData.sender || "customer",
      sender_type: messageData.sender_type || messageData.sender,
      sender_id: messageData.sender_id,
      timestamp:
        messageData.created_at ||
        messageData.timestamp ||
        new Date().toISOString(),
      created_at:
        messageData.created_at ||
        messageData.timestamp ||
        new Date().toISOString(),
      isOptimistic: false,
    };

    const conversationId = messageData.conversation_id || data.conversation_id;

    // Find the chat
    const chatIndex = activeChats.value.findIndex(
      (c) => c.id === String(conversationId)
    );

    if (chatIndex !== -1) {
      const chat = activeChats.value[chatIndex];

      // Add message with deduplication
      addMessageToChat(chat, message);

      // Update last message info
      chat.lastMessage = message.text || message.message || "";
      chat.lastMessageTime = message.timestamp || "";

      // Update unread count if not selected
      if (
        selectedChat.value?.id !== chat.id &&
        !isMessageFromCurrentAdmin(message)
      ) {
        chat.unreadCount++;
      }

      // Move conversation to top of list
      activeChats.value.splice(chatIndex, 1);
      activeChats.value.unshift(chat);
    }
  }

  // Handle raw message objects from server (without type field)
  else if (data.id && data.conversation_id && data.message_text && !data.type) {
    console.log("Received raw message from server:", data);

    const message: Message = {
      id: data.id.toString(),
      text: data.message_text,
      message: data.message_text,
      sender: data.sender_type || "customer",
      sender_type: data.sender_type,
      sender_id: data.sender_id,
      timestamp: data.created_at || new Date().toISOString(),
      created_at: data.created_at || new Date().toISOString(),
      isOptimistic: false,
    };

    const conversationId = String(data.conversation_id);

    // Find the chat
    const chatIndex = activeChats.value.findIndex(
      (c) => c.id === conversationId
    );

    if (chatIndex !== -1) {
      const chat = activeChats.value[chatIndex];

      console.log("Processing raw message for chat:", {
        messageId: message.id,
        sender_id: data.sender_id,
        current_admin_id: currentAdminId.value,
        isFromAdmin: isMessageFromCurrentAdmin(message),
        chatId: chat.id,
      });

      // Add message with deduplication
      addMessageToChat(chat, message);

      // Update last message info
      chat.lastMessage = message.text || message.message || "";
      chat.lastMessageTime = message.timestamp || "";

      // Update unread count if not selected
      if (
        selectedChat.value?.id !== chat.id &&
        !isMessageFromCurrentAdmin(message)
      ) {
        chat.unreadCount++;
      }

      // Move conversation to top of list
      activeChats.value.splice(chatIndex, 1);
      activeChats.value.unshift(chat);
    }
  }

  // Handle conversation status updates
  else if (data.type === "conversation_status") {
    const status = data.payload?.status || data.status;
    const convId = data.payload?.conversation_id || data.conversation_id;

    console.log("Conversation status updated:", {
      conversationId: convId,
      status,
    });

    if (convId) {
      const chat = activeChats.value.find((c) => c.id === String(convId));
      if (chat) {
        chat.status = status;
      }

      if (selectedChat.value?.id === String(convId)) {
        selectedChat.value.status = status;
      }
    }
  }

  // Handle typing indicator
  else if (data.type === "typing") {
    // You can add typing indicator logic here if needed
    console.log("Typing indicator:", data);
  }

  // Handle error messages
  else if (data.type === "error") {
    console.error("WebSocket error:", data);
    error.value = data.message || "WebSocket error occurred";
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

// Watch for new messages to auto-scroll
watch(
  () => selectedChat.value?.messages.length,
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

onMounted(async () => {
  // Restore admin user ID from localStorage if available
  const savedAdminId = localStorage.getItem("admin_user_id");
  if (savedAdminId) {
    currentAdminId.value = savedAdminId;
    console.log("Restored admin user ID from localStorage:", savedAdminId);
  }

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
  // Stop WebSocket on component unmount
  disconnect();
});
</script>
