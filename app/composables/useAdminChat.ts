import { ref, nextTick } from "vue";
import type { Message } from "~/types/message";

export interface AdminMessage extends Message {
  sender: "customer" | "admin";
  message?: string;
}

export interface Chat {
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
  messages: AdminMessage[];
  created_at?: string;
  updated_at?: string;
}

export const useAdminChat = () => {
  const activeChats = ref<Chat[]>([]);
  const selectedChat = ref<Chat | null>(null);
  const messagesContainer = ref<HTMLElement | null>(null);
  const currentAdminId = ref<string | null>(null);
  const recentlySentMessages = ref<Set<string>>(new Set());
  const isLoading = ref(false);
  const loadingMessages = ref(false);
  const error = ref("");

  const config = useRuntimeConfig();
  const { token } = useAuth();

  // Helper: Check if message is from current admin
  const isMessageFromCurrentAdmin = (msg: AdminMessage): boolean => {
    if (msg.sender_id && currentAdminId.value) {
      return msg.sender_id.toString() === currentAdminId.value;
    }
    return msg.sender === "admin" || msg.sender_type === "admin";
  };

  // Helper: Check if message exists in chat
  const messageExistsInChat = (chat: Chat, messageId: string): boolean => {
    return chat.messages.some(
      (msg) => msg.id.toString() === messageId.toString()
    );
  };

  // Helper: Check if message was recently sent
  const isRecentlySentMessage = (
    text: string,
    senderId: string | number
  ): boolean => {
    if (senderId && senderId.toString() === currentAdminId.value) {
      return recentlySentMessages.value.has(text.trim());
    }
    return false;
  };

  // Helper: Replace optimistic message with real one
  const replaceOptimisticMessage = (
    chat: Chat,
    text: string,
    realMessage: AdminMessage
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

      chat.messages[optimisticIndex] = {
        ...realMessage,
        isOptimistic: false,
      };

      setTimeout(() => {
        recentlySentMessages.value.delete(text.trim());
      }, 2000);
    }
  };

  // Add message to chat with deduplication
  const addMessageToChat = (chat: Chat, newMsg: AdminMessage) => {
    // Check for duplicate from current admin
    if (
      newMsg.sender_id &&
      currentAdminId.value &&
      newMsg.sender_id.toString() === currentAdminId.value
    ) {
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

        replaceOptimisticMessage(
          chat,
          newMsg.text || newMsg.message || "",
          newMsg
        );
        return;
      }
    }

    // Check if message already exists by ID
    if (messageExistsInChat(chat, newMsg.id.toString())) {
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

  // Scroll to bottom
  const scrollToBottom = () => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  };

  // Fetch conversations from API
  const fetchConversations = async () => {
    isLoading.value = true;
    error.value = "";

    try {
      const tokenValue = token?.value ?? null;

      const response = await $fetch<{ data: any[] }>(
        `${config.public.apiBase}/api/conversations`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(tokenValue && { Authorization: `Bearer ${tokenValue}` }),
          },
        }
      );

      console.log("Conversations response:", response);

      const conversations = response.data || response;

      activeChats.value = conversations.map((conv: any) => ({
        id: conv.id.toString(),
        customer_id:
          conv.customer_id?.toString() || conv.customerId?.toString(),
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
  const fetchMessages = async (
    conversationId: string
  ): Promise<AdminMessage[]> => {
    loadingMessages.value = true;

    try {
      const tokenValue = token?.value ?? null;

      const response = await $fetch<{ data: any[] }>(
        `${config.public.apiBase}/api/conversations/${conversationId}/messages`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(tokenValue && { Authorization: `Bearer ${tokenValue}` }),
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

  // Select a chat and load messages
  const selectChat = async (chat: Chat) => {
    selectedChat.value = chat;
    chat.unreadCount = 0;
    recentlySentMessages.value.clear();

    const messages = await fetchMessages(chat.id);
    chat.messages = messages;

    nextTick(() => scrollToBottom());
  };

  // Create optimistic message
  const createOptimisticMessage = (
    text: string,
    tempId: string
  ): AdminMessage => {
    return {
      id: tempId,
      text,
      message: text,
      sender: "admin",
      sender_type: "admin",
      sender_id: currentAdminId.value,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      isOptimistic: true,
    };
  };

  // Remove optimistic message on error
  const removeOptimisticMessage = (chat: Chat, tempId: string) => {
    const msgIndex = chat.messages.findIndex((m) => m.id === tempId);
    if (msgIndex !== -1) {
      chat.messages.splice(msgIndex, 1);
    }
  };

  // Handle WebSocket messages for admin
  const handleWebSocketMessage = (data: any) => {
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
      return { type: "connected" };
    }

    // Handle new conversation creation
    if (data.type === "conversation_created") {
      const newConversation = data.payload;

      if (newConversation) {
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

          activeChats.value.unshift(chat);
          console.log("New conversation added to list:", chat);
        }
      }
      return { type: "conversation_created" };
    }

    // Handle incoming messages (typed or raw)
    const isTypedMessage =
      data.type === "new_message" || data.type === "message";
    const isRawMessage =
      data.id && data.conversation_id && data.message_text && !data.type;

    if (isTypedMessage || isRawMessage) {
      const messageData = isTypedMessage ? data.payload || data : data;

      const message: AdminMessage = {
        id: messageData.id?.toString() || Date.now().toString(),
        text:
          messageData.text || messageData.message || messageData.message_text,
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

      const conversationId = String(
        messageData.conversation_id || data.conversation_id
      );
      const chatIndex = activeChats.value.findIndex(
        (c) => c.id === conversationId
      );

      if (chatIndex !== -1) {
        const chat = activeChats.value[chatIndex];

        addMessageToChat(chat, message);

        chat.lastMessage = message.text || message.message || "";
        chat.lastMessageTime = message.timestamp || "";

        if (
          selectedChat.value?.id !== chat.id &&
          !isMessageFromCurrentAdmin(message)
        ) {
          chat.unreadCount++;
        }

        activeChats.value.splice(chatIndex, 1);
        activeChats.value.unshift(chat);
      }

      return { type: "message", message };
    }

    // Handle conversation status updates
    if (data.type === "conversation_status") {
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

      return { type: "conversation_status", status };
    }

    // Handle errors
    if (data.type === "error") {
      console.error("WebSocket error:", data);
      error.value = data.message || "WebSocket error occurred";
      return { type: "error" };
    }

    // Log unhandled
    console.warn("Unhandled WebSocket message type:", {
      type: data.type,
      hasId: !!data.id,
      hasConversationId: !!data.conversation_id,
      hasMessageText: !!data.message_text,
      fullData: data,
    });

    return { type: "unhandled" };
  };

  // Update conversation status
  const updateConversationStatus = async (
    conversationId: string,
    status: string
  ) => {
    try {
      const tokenValue = token?.value ?? null;

      await $fetch(
        `${config.public.apiBase}/api/conversations/${conversationId}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(tokenValue && { Authorization: `Bearer ${tokenValue}` }),
          },
          body: { status },
        }
      );

      await fetchConversations();
    } catch (err) {
      console.error("Error updating conversation status:", err);
      throw err;
    }
  };

  // Format time helper
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

  // Initialize from localStorage
  const initializeFromStorage = () => {
    const savedAdminId = localStorage.getItem("admin_user_id");
    if (savedAdminId) {
      currentAdminId.value = savedAdminId;
      console.log("Restored admin user ID from localStorage:", savedAdminId);
    }
  };

  return {
    // State
    activeChats,
    selectedChat,
    messagesContainer,
    currentAdminId,
    recentlySentMessages,
    isLoading,
    loadingMessages,
    error,

    // Methods
    isMessageFromCurrentAdmin,
    addMessageToChat,
    scrollToBottom,
    fetchConversations,
    fetchMessages,
    selectChat,
    createOptimisticMessage,
    removeOptimisticMessage,
    handleWebSocketMessage,
    updateConversationStatus,
    formatTime,
    initializeFromStorage,
  };
};
