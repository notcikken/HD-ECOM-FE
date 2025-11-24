import { apiGet } from "~/services/apiService";

export const getNotification = async (token: string) => {
  try {
    return await apiGet(`/api/conversations/notifications`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch (error) {
    console.error("Error fetching message history:", error);
    throw error;
  }
};
