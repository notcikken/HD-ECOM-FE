import { ref, onUnmounted } from "vue";

import type { WebSocketMessage } from "~/types/websocket";

interface DebugLog {
  timestamp: string;
  type: "info" | "error" | "warning" | "success";
  message: string;
  data?: any;
}

export const useWebsocket = (url: string) => {
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const connectionError = ref<string | null>(null);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;
  const isAuthenticated = ref(false);
  const debugLogs = ref<DebugLog[]>([]);
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let messageHandlers: Array<(data: WebSocketMessage) => void> = [];

  const addDebugLog = (type: DebugLog["type"], message: string, data?: any) => {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data,
    };
    debugLogs.value.push(log);

    // Console output with colors
    const style = {
      info: "color: blue",
      error: "color: red",
      warning: "color: orange",
      success: "color: green",
    };

    console.log(
      `%c[WebSocket ${type.toUpperCase()}] ${message}`,
      style[type],
      data || ""
    );

    // Keep only last 50 logs
    if (debugLogs.value.length > 50) {
      debugLogs.value.shift();
    }
  };

  const connect = () => {
    try {
      connectionError.value = null;
      addDebugLog("info", "Starting WebSocket connection...");

      // Get auth token if available
      const { token } = useAuth();
      const tokenValue = token?.value ?? null;

      if (tokenValue) {
        addDebugLog("success", "JWT Token found", {
          tokenPreview: `${tokenValue.substring(0, 20)}...`,
          tokenLength: tokenValue.length,
        });
      } else {
        addDebugLog("warning", "No JWT token found - connecting as guest");
      }

      // Add token as query parameter
      const wsUrl = tokenValue
        ? `${url}?token=${encodeURIComponent(tokenValue)}`
        : url;

      addDebugLog("info", "WebSocket URL prepared", {
        url: wsUrl.replace(/token=[^&]+/, "token=***HIDDEN***"),
        hasToken: !!tokenValue,
      });

      ws.value = new WebSocket(wsUrl);

      ws.value.onopen = () => {
        addDebugLog("success", "WebSocket connection opened");
        isConnected.value = true;
        isAuthenticated.value = !!token;
        connectionError.value = null;
        reconnectAttempts.value = 0;

        // Send initial ping/connect message
        const connectMessage = {
          type: "connect",
          timestamp: new Date().toISOString(),
        };

        addDebugLog("info", "Sending connect message", connectMessage);
        sendMessage(connectMessage);
      };

      ws.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          addDebugLog("info", "Message received from server", {
            data,
          });

          // Handle authentication response from server
          if (data.type === "auth_success") {
            isAuthenticated.value = true;
            addDebugLog("success", "Authentication successful", {
              payload: data.payload,
            });
          } else if (data.type === "auth_error" || data.type === "error") {
            isAuthenticated.value = false;
            const errorMsg =
              data.payload?.message || data.message || "Authentication failed";
            connectionError.value = errorMsg;
            addDebugLog("error", "Authentication error from server", {
              message: errorMsg,
              fullResponse: data,
            });

            if (data.type === "auth_error") {
              addDebugLog(
                "error",
                "Connection will be closed due to auth failure"
              );
              disconnect();
              return;
            }
          }

          // Call all registered message handlers
          messageHandlers.forEach((handler) => handler(data));
        } catch (error) {
          addDebugLog("error", "Error parsing server message", {
            error: error instanceof Error ? error.message : String(error),
            rawData: event.data,
          });
        }
      };

      ws.value.onerror = (error) => {
        addDebugLog("error", "WebSocket error occurred", {
          error: error,
          readyState: ws.value?.readyState,
        });
        connectionError.value = "Connection error occurred";
        isAuthenticated.value = false;
      };

      ws.value.onclose = (event) => {
        addDebugLog("warning", "WebSocket connection closed", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });

        isConnected.value = false;
        isAuthenticated.value = false;

        // Interpret close codes
        if (event.code === 1000) {
          addDebugLog("info", "Normal closure");
        } else if (event.code === 1006) {
          addDebugLog(
            "error",
            "Abnormal closure - connection lost unexpectedly"
          );
        } else if (event.code === 1008) {
          addDebugLog("error", "Policy violation - likely auth failure");
          connectionError.value = "Authentication failed (Code 1008)";
        } else if (event.code === 4001) {
          addDebugLog("error", "Custom: Unauthorized (401)");
          connectionError.value = "Unauthorized - Invalid or missing token";
        }

        // Handle reconnection
        if (!event.wasClean && reconnectAttempts.value < maxReconnectAttempts) {
          connectionError.value = "Connection lost. Reconnecting...";
          scheduleReconnect();
        } else if (reconnectAttempts.value >= maxReconnectAttempts) {
          connectionError.value = "Unable to connect. Please refresh the page.";
          addDebugLog(
            "error",
            "Max reconnection attempts reached",
            reconnectAttempts.value
          );
        }
      };
    } catch (error) {
      addDebugLog("error", "Error creating WebSocket", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      connectionError.value = "Failed to establish connection";
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }

    reconnectAttempts.value++;
    addDebugLog(
      "info",
      `Scheduling reconnect attempt ${reconnectAttempts.value}/${maxReconnectAttempts}`
    );

    reconnectTimeout = setTimeout(() => {
      addDebugLog(
        "info",
        `Reconnection attempt ${reconnectAttempts.value}/${maxReconnectAttempts}`
      );
      connect();
    }, reconnectDelay);
  };

  const disconnect = () => {
    addDebugLog("info", "Disconnecting WebSocket");

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }

    isConnected.value = false;
    isAuthenticated.value = false;
    connectionError.value = null;
  };

  const sendMessage = (data: WebSocketMessage) => {
    if (ws.value && isConnected.value) {
      const jsonData = JSON.stringify(data);
      addDebugLog("info", "Sending message to server", {
        data,
      });
      ws.value.send(jsonData);
    } else {
      addDebugLog("error", "Cannot send message - not connected", {
        isConnected: isConnected.value,
        wsExists: !!ws.value,
      });
      throw new Error("WebSocket is not connected");
    }
  };

  const sendChatMessage = async (
    text: string,
    conversationId?: string | number
  ) => {
    return new Promise((resolve, reject) => {
      try {
        // Convert conversation_id to number if it's a string
        const convId = conversationId
          ? typeof conversationId === "string"
            ? parseInt(conversationId, 10)
            : conversationId
          : undefined;

        const message = {
          type: "send_message",
          payload: {
            text: text,
            ...(convId && { conversation_id: convId }),
          },
        };

        addDebugLog("info", "Sending chat message", {
          type: message.type,
          payload: message.payload,
          textPreview: text.substring(0, 50),
          conversationId: convId || "auto-create (backend will create)",
        });

        sendMessage(message);

        // Log that we're waiting for conversation_created event if no ID
        if (!convId) {
          addDebugLog(
            "info",
            "No conversation_id provided - backend should create conversation and send conversation_created event"
          );
        }

        resolve(true);
      } catch (error) {
        addDebugLog("error", "Failed to send chat message", {
          error: error instanceof Error ? error.message : String(error),
        });
        reject(error);
      }
    });
  };

  const onMessage = (handler: (data: WebSocketMessage) => void) => {
    messageHandlers.push(handler);
    addDebugLog("info", "Message handler registered");
  };

  const reconnect = () => {
    addDebugLog("info", "Manual reconnection triggered");
    reconnectAttempts.value = 0;
    connectionError.value = null;
    disconnect();
    connect();
  };

  const clearDebugLogs = () => {
    debugLogs.value = [];
    addDebugLog("info", "Debug logs cleared");
  };

  const exportDebugLogs = () => {
    const logsJson = JSON.stringify(debugLogs.value, null, 2);
    const blob = new Blob([logsJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `websocket-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addDebugLog("success", "Debug logs exported");
  };

  // Cleanup on component unmount
  onUnmounted(() => {
    addDebugLog("info", "Component unmounting - cleaning up");
    disconnect();
    messageHandlers = [];
  });

  return {
    isConnected,
    isAuthenticated,
    connectionError,
    debugLogs,
    connect,
    disconnect,
    sendMessage,
    sendChatMessage,
    onMessage,
    reconnect,
    clearDebugLogs,
    exportDebugLogs,
  };
};
