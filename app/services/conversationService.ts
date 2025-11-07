import { apiGet, apiPatch } from "~/services/apiService";

/**
 * Conversation-related HTTP helpers.
 * These are plain services and do not call Nuxt composables at module scope.
 */

export const getConversation = async (
  token: string | null,
  conversationId: string
) => {
  try {
    return await apiGet(`/api/conversations/${conversationId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw error;
  }
};

export const updateConversationStatus = async (
  token: string | null,
  conversationId: string,
  status: string
) => {
  try {
    return await apiPatch(
      `/api/conversations/${conversationId}`,
      { status },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
  } catch (error) {
    console.error("Error updating conversation status:", error);
    throw error;
  }
};
