import { ref } from "vue";
import { getSupportUsers, type SupportUser } from "~/services/supportUserService";
import { useCookie } from "#imports";

export const useSupportUsers = () => {
  const supportUsers = ref<SupportUser[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const token = useCookie<string>("auth-token");

  const fetchSupportUsers = async (): Promise<SupportUser[]> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await getSupportUsers(token.value);
      supportUsers.value = response.data || [];
      return supportUsers.value;
    } catch (err) {
      error.value = "Failed to fetch support users";
      console.error(err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  return {
    supportUsers,
    loading,
    error,
    fetchSupportUsers,
  };
};