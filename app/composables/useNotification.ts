import { ref } from "vue";
import { getNotification } from "~/services/notificationService";
import type { Notification } from "~/types/notification";
import { useCookie } from "#imports";

export const useNotification = () => {
  const notification = useState<Notification[] | null>(
    "notifications",
    () => null
  );
  const ticketNotifications = useState<{
    customer_open_tickets: number;
    seller_open_tickets: number;
    total_open_tickets: number;
  } | null>("ticketNotifications", () => null);
  const token = useCookie<string>("auth-token");

  const fetchNotification = async (): Promise<Notification[] | null> => {
    const resp = await getNotification(token.value);

    const data = resp.data;
    if (data) {
      const notifications: Notification[] = data.conversation_states.map((n: any) => ({
        conversationId: n.conversation_id,
        unreadCount: n.unread_count,
      }));
      console.log("Fetched notifications:", notifications);
      notification.value = notifications;
      ticketNotifications.value = data.ticket_notifications;
      console.log("Notification updated:", notification.value);
      console.log("Ticket notifications updated:", ticketNotifications.value);
      return notification.value;
    }
    return null;
  };

  // Handle WebSocket admin_notification updates
  const updateNotificationFromWebSocket = (wsNotification: any) => {
    if (!notification.value) {
      notification.value = [];
    }

    const conversationId = wsNotification.conversation_id;
    const unreadCount = wsNotification.unread_count || 0;

    // Find existing notification for this conversation
    const existingIndex = notification.value.findIndex(
      (n) => n.conversationId === conversationId
    );

    const updatedNotification: Notification = {
      conversationId,
      unreadCount,
    };

    if (existingIndex !== -1) {
      // Update existing notification
      notification.value[existingIndex] = updatedNotification;
    } else {
      // Add new notification
      notification.value.push(updatedNotification);
    }

    // Remove notifications with 0 unread count
    notification.value = notification.value.filter((n) => n.unreadCount > 0);

    console.log("Notification updated from WebSocket:", {
      conversationId,
      unreadCount,
      totalNotifications: notification.value.length,
    });
  };

  return {
    notification,
    ticketNotifications,
    fetchNotification,
    updateNotificationFromWebSocket,
  };
};
