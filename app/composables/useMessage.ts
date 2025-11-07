import { ref, nextTick } from "vue";
import type { Message } from "~/types/message";

export const useMessage = () => {
  const messages = ref<Message[]>([]);
  const recentlySentMessages = ref<Set<string>>(new Set());
  const currentUserId = ref<string | null>(null);
  const conversationId = ref<string | null>(null);
  const messagesContainer = ref<HTMLElement | null>(null);

  // Helper: Check if message is from current user
  const isMessageFromCurrentUser = (msg: any): boolean => {
    if (msg.sender_id && currentUserId.value) {
      return msg.sender_id.toString() === currentUserId.value;
    }
    return msg.sender_type === "customer" || msg.sender_type === "user";
  };

  // Helper: Check if message already exists
  const messageExists = (messageId: number | string): boolean => {
    return messages.value.some(
      (msg) => msg.id.toString() === messageId.toString()
    );
  };

  // Helper: Check if message text was recently sent
  const isRecentlySentMessage = (
    text: string,
    senderId: string | number
  ): boolean => {
    if (
      senderId &&
      currentUserId.value &&
      senderId.toString() === currentUserId.value
    ) {
      return recentlySentMessages.value.has(text.trim());
    }
    return false;
  };

  // Helper: Replace optimistic message with real one
  const replaceOptimisticMessage = (text: string, realMessage: Message) => {
    const optimisticIndex = messages.value.findIndex(
      (msg) => msg.isOptimistic && msg.text.trim() === text.trim()
    );

    if (optimisticIndex !== -1 && messages.value[optimisticIndex]) {
      // optimistic -> real replacement

      messages.value[optimisticIndex] = {
        ...realMessage,
        isOptimistic: false,
      };

      setTimeout(() => {
        recentlySentMessages.value.delete(text.trim());
      }, 2000);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  };

  // Add message with deduplication
  const addMessage = (newMsg: Message, playSound = false, isOpen = true) => {
    // Check for duplicate from current user
    if (
      newMsg.sender_id &&
      currentUserId.value &&
      newMsg.sender_id.toString() === currentUserId.value
    ) {
      if (isRecentlySentMessage(newMsg.text, newMsg.sender_id)) {
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

    // Message added to UI

    // Scroll to bottom
    nextTick(() => {
      scrollToBottom();
    });
  };

  // Handle WebSocket message data
  const handleWebSocketMessage = (data: any, isOpen: boolean) => {
    // Processing incoming websocket data

    // Handle connection - capture user ID
    if (data.type === "connected") {
      const userId =
        data.user_id || data.payload?.user_id || data.fullData?.user_id;

      if (userId) {
        currentUserId.value = userId.toString();
        // User ID set from WebSocket
        localStorage.setItem("chat_user_id", String(currentUserId.value));
      }
      return { type: "connected", userId };
    }

    // Handle conversation loaded
    if (data.type === "conversation_loaded") {
      const convId = data.conversation_id;
      conversationId.value = convId ? String(convId) : null;

      // Conversation loaded

      if (conversationId.value) {
        localStorage.setItem(
          "active_conversation_id",
          String(conversationId.value)
        );
      }

      return { type: "conversation_loaded", conversationId: convId };
    }

    // Handle message history
    if (data.type === "message_history") {
      const historyMessages = data.messages || [];
      // Loading message history

      messages.value = [];
      recentlySentMessages.value.clear();

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

        nextTick(() => scrollToBottom());
      }

      return { type: "message_history", count: historyMessages.length };
    }

    // Handle conversation creation
    if (data.type === "conversation_created") {
      const convId = data.payload?.conversation_id || data.conversation_id;
      conversationId.value = convId ? String(convId) : null;

      // Conversation created

      if (conversationId.value) {
        localStorage.setItem(
          "active_conversation_id",
          String(conversationId.value)
        );
      }

      if (
        messages.value.length === 0 ||
        messages.value.every((m) => !m.isUser)
      ) {
        addMessage(
          {
            id: Date.now(),
            text: "Percakapan dimulai. Admin akan segera membalas pesan Anda.",
            isUser: false,
            timestamp: new Date(),
            isOptimistic: false,
          },
          false,
          isOpen
        );
      }

      return { type: "conversation_created", conversationId: convId };
    }

    // Handle incoming chat messages (with type)
    if (data.type === "message" || data.type === "new_message") {
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

      addMessage(newMsg, true, isOpen);
      return { type: "new_message", message: newMsg };
    }

    // Handle raw message objects (without type field)
    if (data.id && data.conversation_id && data.message_text && !data.type) {
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

      addMessage(newMsg, true, isOpen);
      return { type: "raw_message", message: newMsg };
    }

    // Handle conversation status updates
    if (data.type === "conversation_status") {
      const status = data.payload?.status || data.status;
      // Conversation status updated

      if (status === "closed") {
        addMessage(
          {
            id: Date.now(),
            text: "Percakapan ini telah ditutup oleh admin.",
            isUser: false,
            timestamp: new Date(),
            isOptimistic: false,
          },
          false,
          isOpen
        );

        conversationId.value = null;
        localStorage.removeItem("active_conversation_id");
      }

      return { type: "conversation_status", status };
    }

    // Handle errors
    if (data.type === "error") {
      console.error("WebSocket error:", data);

      addMessage(
        {
          id: Date.now(),
          text: `Error: ${data.message || "Terjadi kesalahan pada koneksi"}`,
          isUser: false,
          timestamp: new Date(),
          isOptimistic: false,
        },
        false,
        isOpen
      );

      return { type: "error", message: data.message };
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
  const createOptimisticMessage = (text: string, tempId: number): Message => {
    return {
      id: tempId,
      text,
      isUser: true,
      timestamp: new Date(),
      sender_id: currentUserId.value || undefined,
      isOptimistic: true,
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
    const savedUserId = localStorage.getItem("chat_user_id");
    if (savedUserId) {
      currentUserId.value = savedUserId;
      // Restored user ID from localStorage
    }

    const savedConvId = localStorage.getItem("active_conversation_id");
    if (savedConvId) {
      conversationId.value = savedConvId;
      // Restored conversation ID from localStorage
    }
  };

  // Add welcome message
  const addWelcomeMessage = () => {
    if (messages.value.length === 0) {
      messages.value.push({
        id: Date.now(),
        text: "Halo! 👋 Selamat datang di SecondCycle Help Center. Ada yang bisa kami bantu?",
        isUser: false,
        timestamp: new Date(),
        isOptimistic: false,
      });
    }
  };

  // Format time helper
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
    formatTime,
    isMessageFromCurrentUser,
  };
};
