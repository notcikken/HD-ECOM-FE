import { ref } from "vue";
import { getNotification } from "~/services/notificationService";
import type { Notification } from "~/types/notification";
import { useCookie } from "#imports";

export const useNotification = () => {
  const notification = ref<Notification[] | null>(null);
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
        notification.value = notifications;
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
