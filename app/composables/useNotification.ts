import { ref } from "vue";
import { getNotification } from "~/services/notificationService";
import type { Notification } from "~/types/notification";
import { useCookie } from "#imports";

// Shared global state so all callers get the same ref
export const useNotification = () => {
  const notification = useState<Notification[] | null>(
    "notifications",
    () => null
  );
  const token = useCookie<string>("auth-token");

  const fetchNotification = async (): Promise<Notification[] | null> => {
    try {
      const resp = await getNotification(token.value);

      const data = resp.data;
      if (data) {
        const notifications: Notification[] = data.map((n: any) => ({
          conversationId: n.conversation_id,
          unreadCount: n.unread_count,
        }));
        console.log("Fetched notifications:", notifications);
        notification.value = notifications;
        console.log("Notification updated:", notification.value);
        return notification.value;
      }
      return null;
    } catch (err) {
      throw err;
    }
  };

  return {
    notification,
    fetchNotification,
  };
};
