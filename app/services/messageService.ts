import { apiGet } from "~/services/apiService";

export const getMessagesHistory = async (
  token: string,
  conversationId: number,
  opts?: { limit?: number; cursor?: string }
) => {
  try {
    const qp = new URLSearchParams();
    if (opts?.limit) qp.set("limit", String(opts.limit));
    if (opts?.cursor) qp.set("cursor", String(opts.cursor));

    const url = `/api/conversations/${conversationId}/messages${
      qp.toString() ? `?${qp.toString()}` : ""
    }`;

    return await apiGet(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch (error) {
    console.error("Error fetching message history:", error);
    throw error;
  }
};
