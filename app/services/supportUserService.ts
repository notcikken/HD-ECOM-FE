import { apiGet } from "~/services/apiService";

export interface SupportUser {
  user_id: number;
  username: string;
}

export const getSupportUsers = async (token: string) => {
  try {
    return await apiGet<{ data: SupportUser[] }>(`/api/users/support`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch (error) {
    console.error("Error fetching support users:", error);
    throw error;
  }
};