import { apiGet, apiPost } from "~/services/apiService";

export const getConversation = async (token: string) => {
  try {
    return await apiGet(`/api/conversations`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error, token);
    throw error;
  }
};

export const createConversation = async (token: string) => {
  try {
    return await apiPost(`/api/conversations`, undefined, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch (error) {
    console.error("Error creating conversation:", error, token);
    throw error;
  }
};

export const closeConversation = async (
  token: string,
  conversationId: number
) => {
  try {
    return await apiPost(
      `/api/conversations/${conversationId}/close`,
      undefined,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
  } catch (error) {
    console.error("Error closing conversation:", error, token, conversationId);
    throw error;
  }
};
