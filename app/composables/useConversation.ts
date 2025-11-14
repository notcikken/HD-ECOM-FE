import { ref } from "vue";
import {
  getConversation,
  createConversation,
} from "~/services/conversationService";

const selectedConversation = ref<any | null>(null);

export const useConversation = () => {
  const token = useCookie<string>("auth-token");

  const fetchConversation = async () => {
    try {
      const resp = await getConversation(token.value);
      return resp;
    } catch (err) {
      throw err;
    }
  };

  const startConversation = async () => {
    try {
      const resp = await createConversation(token.value);
      return resp;
    } catch (err) {
      throw err;
    }
  };

  // Set or clear the currently selected conversation
  const selectConversation = (conversation: any | null) => {
    selectedConversation.value = conversation;
    return selectedConversation.value;
  };

  return {
    fetchConversation,
    startConversation,
    selectedConversation,
    selectConversation,
  };
};
