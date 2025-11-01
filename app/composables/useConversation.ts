export const useConversation = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;

  const getConversation = async (conversationId: string) => {
    try {
      const response = await $fetch(
        `${apiBase}/api/conversations/${conversationId}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching conversation:", error);
      throw error;
    }
  };

  const updateConversationStatus = async (
    conversationId: string,
    status: string
  ) => {
    try {
      const response = await $fetch(
        `${apiBase}/api/conversations/${conversationId}`,
        {
          method: "PATCH",
          body: { status },
        }
      );
      return response;
    } catch (error) {
      console.error("Error updating conversation:", error);
      throw error;
    }
  };

  return {
    getConversation,
    updateConversationStatus,
  };
};
