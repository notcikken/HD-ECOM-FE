import { ref } from "vue";
import {
  getConversation,
  createConversation,
  closeConversation as closeConversationService,
} from "~/services/conversationService";
import type { Conversation } from "~/types/conversation";
import { useCookie } from "#imports";

const selectedConversation = ref<Conversation | null>(null);
const conversations = ref<Array<Conversation>>([]);

export const useConversation = () => {
  const token = useCookie<string>("auth-token");

  // changed: return a typed Conversation[] array
  const fetchConversation = async (): Promise<Conversation[]> => {
    try {
      const resp = await getConversation(token.value);

      const rawList: any[] = Array.isArray(resp.data) ? resp.data : [];

      const convs: Conversation[] = rawList.map((c: any) => ({
        id: c.id,
        customerId: c.user_id,
        adminId: c.admin_id,
        lastMessageAt: new Date(c.last_message_at),
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.updated_at),
        customerName: c.customer_name,
        customerEmail: c.customer_email,
      }));

      return convs;
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

  const closeConversation = async (conversationId: number) => {
    try {
      const resp = await closeConversationService(token.value, conversationId);
      return resp;
    } catch (err) {
      throw err;
    }
  };

  // Set or clear the currently selected conversation
  const selectConversation = (conversation: Conversation | null) => {
    selectedConversation.value = conversation;
    return selectedConversation.value;
  };

  return {
    fetchConversation,
    startConversation,
    selectedConversation,
    selectConversation,
    closeConversation,

    conversations,
  };
};
