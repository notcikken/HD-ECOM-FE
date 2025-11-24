import { ref, nextTick } from "vue";
import type { UserMessage } from "~/types/message";
import { formatTimeToDate } from "~/utils/formatTime";
import { getMessagesHistory } from "~/services/messageService";
import { useCookie } from "#imports";
import { useNotification } from "~/composables/useNotification";

export const useMessage = () => {
  const messages = ref<UserMessage[]>([]);
  const recentlySentMessages = ref<Set<string>>(new Set());
  const currentUserId = ref<number | null>(null);
  const conversationId = ref<number>();
  const messagesContainer = ref<HTMLElement | null>(null);

  const token = useCookie<string>("auth-token");
  const { updateNotificationFromWebSocket } = useNotification();

  // Helper: Check if message is from current user
  const isMessageFromCurrentUser = (msg: UserMessage): boolean => {
    if (msg.senderId && currentUserId.value) {
      return msg.senderId === currentUserId.value;
    }
    return false;
  };

  // Helper: Check if message already exists
  const messageExists = (messageId: number): boolean => {
    return messages.value.some((msg) => msg.id === messageId);
  };

  // Helper: Check if message text was recently sent
  const isRecentlySentMessage = (text: string, senderId: number): boolean => {
    if (senderId && currentUserId.value && senderId === currentUserId.value) {
      return recentlySentMessages.value.has(text.trim());
    }
    return false;
  };

  // Helper: Replace optimistic message with real one
  const replaceOptimisticMessage = (text: string, realMessage: UserMessage) => {
    const optimisticIndex = messages.value.findIndex(
      (msg) => msg.id < 0 && msg.text.trim() === text.trim()
    );

    if (optimisticIndex !== -1 && messages.value[optimisticIndex]) {
      messages.value[optimisticIndex] = {
        ...realMessage,
      };

      setTimeout(() => {
        recentlySentMessages.value.delete(text.trim());
      }, 2000);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = async () => {
    // Ensure DOM updates completed
    await nextTick();
    // Wait for browser paint to ensure accurate scrollHeight
    requestAnimationFrame(() => {
      if (messagesContainer.value) {
        try {
          messagesContainer.value.scrollTop =
            messagesContainer.value.scrollHeight;
        } catch (e) {
          // safe guard: element may be detached
          console.warn("[useMessage] scrollToBottom failed", e);
        }
      } else {
        // helpful debug when ref isn't set
        console.warn(
          "[useMessage] messagesContainer ref is null when scrolling"
        );
      }
    });
  };

  // Add message with deduplication
  const addMessage = (newMsg: UserMessage) => {
    console.log("Adding message:", newMsg);
    // Check for duplicate from current user
    if (
      newMsg.senderId &&
      currentUserId.value &&
      newMsg.senderId === currentUserId.value
    ) {
      if (isRecentlySentMessage(newMsg.text, newMsg.senderId)) {
        // Detected broadcast echo from server; replace optimistic message
        replaceOptimisticMessage(newMsg.text, newMsg);
        return;
      }
    }

    // Check if message already exists by ID
    if (messageExists(newMsg.id)) {
      // Message already exists by ID, skip
      return;
    }

    // Add message to array
    messages.value.push(newMsg);

    // Scroll to bottom
    nextTick(() => {
      scrollToBottom();
    });
  };

  // Handle WebSocket message data
  const handleWebSocketMessage = (data: any) => {
    // Handle connection - capture user ID
    if (data.type === "connected") {
      const userId = data.payload.user_id;

      if (userId) {
        currentUserId.value = Number(userId);
        localStorage.setItem("message_user_id", String(currentUserId.value));
      }
      return { type: "connected", userId };
    }

    if (data.type === "subscribed") {
      const conversationId = data.payload.conversation_id;

      // Reset unread count when successfully subscribed
      if (conversationId) {
        updateNotificationFromWebSocket({
          conversation_id: conversationId,
          unread_count: 0,
        });
      }

      return {
        type: "subscribed",
        conversationId: conversationId,
      };
    }

    // Handle incoming chat messages (with type)
    if (data.type === "new_message") {
      const messageData = data.payload;

      const newMsg: UserMessage = {
        id: messageData.id || Date.now(),
        text: messageData.message_text || "",
        createdAt: messageData.created_at
          ? new Date(messageData.created_at)
          : new Date(),
        conversationId: messageData.conversation_id,
        senderId: messageData.sender_id,
        sender: messageData.sender_type,
      };

      addMessage(newMsg);
      return { type: "new_message", message: newMsg };
    }

    if (data.type === "unsubscribed") {
      return { type: "unsubscribed" };
    }

    if (data.type === "admin_notification") {
      const notification = data.payload;

      // Update global notification state
      updateNotificationFromWebSocket(notification);

      return { type: "admin_notification", notification };
    }

    // New conversation created by backend (customer started chat)
    if (data.type === "conversation_created") {
      const payload = data.payload || {};
      const convRaw = payload.conversation || {};
      const adminState = payload.admin_state || {};
      const customer = payload.customer || {};

      const conv = {
        id: convRaw.id,
        customerName: customer.username || customer.name || "Customer",
        customerEmail: customer.email || "",
        lastMessage: convRaw.last_message_at ? "" : "", // no message text yet
        lastMessageTime: convRaw.last_message_at
          ? new Date(convRaw.last_message_at)
          : new Date(),
        isOnline: false,
        unreadCount: adminState.unread_count ?? 0,
        createdAt: convRaw.created_at
          ? new Date(convRaw.created_at)
          : new Date(),
        updatedAt: convRaw.updated_at
          ? new Date(convRaw.updated_at)
          : new Date(),
      };

      // keep global notification state in sync
      updateNotificationFromWebSocket({
        conversation_id: conv.id,
        unread_count: conv.unreadCount,
      });

      return { type: "conversation_created", conversation: conv, raw: payload };
    }

    // Handle errors
    if (data.type === "error") {
      console.error("WebSocket error:", data);

      addMessage({
        id: Date.now(),
        senderId: 0,
        sender: "admin",
        conversationId: conversationId.value!,
        text: `Error: ${data.error || "Terjadi kesalahan pada koneksi"}`,
        createdAt: new Date(),
      });

      return { type: "error", message: data.error };
    }

    // Log unhandled message types
    console.warn("Unhandled WebSocket message type:", {
      type: data.type,
      hasId: !!data.id,
      hasConversationId: !!data.conversation_id,
      hasMessageText: !!data.message_text,
      fullData: data,
    });

    return { type: "unhandled", data };
  };

  // Create optimistic message for sending
  const createOptimisticMessage = (
    text: string,
    tempId: number
  ): UserMessage => {
    return {
      id: -Math.abs(tempId), // ID negatif menandai optimistic
      conversationId: conversationId.value || 0,
      sender: "customer",
      text,
      createdAt: new Date(),
      senderId: currentUserId.value || 0,
    };
  };

  // Remove optimistic message on error
  const removeOptimisticMessage = (tempId: number) => {
    const msgIndex = messages.value.findIndex((m) => m.id === tempId);
    if (msgIndex !== -1) {
      messages.value.splice(msgIndex, 1);
    }
  };

  // Initialize from localStorage
  const initializeFromStorage = () => {
    const savedUserId = localStorage.getItem("message_user_id");
    if (savedUserId) {
      currentUserId.value = Number(savedUserId);
    }

    const savedConvId = localStorage.getItem("conversation_id");
    if (savedConvId) {
      conversationId.value = Number(savedConvId);
    }
  };

  // Add welcome message
  const addWelcomeMessage = () => {
    if (messages.value.length === 0) {
      messages.value.push({
        id: Date.now(),
        text: "Halo! 👋 Selamat datang di SecondCycle Help Center. Ada yang bisa kami bantu?",
        senderId: 0,
        sender: "admin",
        conversationId: conversationId.value || 0,
        createdAt: new Date(),
      });
    }
  };

  // Fetch message history from API and normalize into UserMessage[]
  const fetchMessagesHistory = async (opts?: {
    limit?: number;
    cursor?: string;
  }) => {
    if (!conversationId.value) {
      throw new Error("conversationId is not set");
    }

    try {
      const resp = await getMessagesHistory(
        token.value,
        conversationId.value,
        opts
      );

      const msgsRaw = resp.data.messages || [];

      // Normalize API response to UserMessage[]
      const msgs: UserMessage[] = msgsRaw.map((m: any) => ({
        id: m.id,
        text: m.message_text ?? m.text ?? "",
        createdAt: m.created_at ? new Date(m.created_at) : new Date(),
        conversationId: m.conversation_id ?? m.conversationId ?? 0,
        senderId: m.sender_id ?? 0,
        // set sender type fallback (adjust if your API returns sender_type)
        sender:
          (m.sender_type as any) ?? (m.sender_id === 0 ? "admin" : "customer"),
      }));

      messages.value = msgs;

      // Return meta if present (support both snake_case and camelCase)
      return {
        nextCursor: resp.data.next_cursor ?? resp.data.nextCursor ?? "",
        messages: msgs,
        limit: resp.data.limit ?? undefined,
      };
    } catch (err) {
      console.error("Failed to fetch messages history", err);
      throw err;
    }
  };

  return {
    // State
    messages,
    recentlySentMessages,
    currentUserId,
    conversationId,
    messagesContainer,

    // Methods
    addMessage,
    handleWebSocketMessage,
    createOptimisticMessage,
    removeOptimisticMessage,
    initializeFromStorage,
    addWelcomeMessage,
    scrollToBottom,
    formatTimeToDate,
    isMessageFromCurrentUser,
    fetchMessagesHistory,
  };
};
