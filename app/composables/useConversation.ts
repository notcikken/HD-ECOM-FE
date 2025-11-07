import {
  getConversation as svcGetConversation,
  updateConversationStatus as svcUpdateConversationStatus,
} from "~/services/conversationService";

/**
 * Composable wrapper around conversationService.
 * Calls to Nuxt composables are done inside the function (setup-time), not at module scope.
 */
export const useConversation = () => {
  // token from cookie (safe to call inside composable factory)
  const token = useCookie<string | null>("auth-token");

  const fetchConversation = async (conversationId: string) => {
    if (!conversationId) throw new Error("conversationId is required");
    try {
      const resp = await svcGetConversation(
        token.value ?? null,
        conversationId
      );
      return resp;
    } catch (err) {
      throw err;
    }
  };

  const updateConversationStatus = async (
    conversationId: string,
    status: string
  ) => {
    if (!conversationId) throw new Error("conversationId is required");
    try {
      const resp = await svcUpdateConversationStatus(
        token.value ?? null,
        conversationId,
        status
      );
      return resp;
    } catch (err) {
      throw err;
    }
  };

  return {
    fetchConversation,
    updateConversationStatus,
  };
};
