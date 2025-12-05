export const CATEGORY_MAP: Record<number, string> = {
  1: "Akun & Keamanan",
  2: "Pembayaran",
  3: "Pengiriman",
  4: "Pengembalian",
  5: "Promo & Voucher",
  6: "Teknis Aplikasi",
  7: "Produk",
};

export const STATUS_MAP: Record<number, string> = {
  1: "Open",
  2: "In Progress",
  3: "Resolved",
};

export const PRIORITY_MAP: Record<number, string> = {
  0: "Not Set",
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Urgent",
};

export const getCategoryLabel = (categoryId: number | string): string => {
  const id = typeof categoryId === "string" ? parseInt(categoryId) : categoryId;
  return CATEGORY_MAP[id] || `Unknown (${categoryId})`;
};

export const getStatusLabel = (statusId: number | string): string => {
  const id = typeof statusId === "string" ? parseInt(statusId) : statusId;
  return STATUS_MAP[id] || `Unknown (${statusId})`;
};

export const getPriorityLabel = (priorityId: number | string): string => {
  const id = typeof priorityId === "string" ? parseInt(priorityId) : priorityId;
  return PRIORITY_MAP[id] || `Unknown (${priorityId})`;
};

export const getStatusBadgeClass = (status: string): string => {
  const classes: Record<string, string> = {
    Open: "bg-blue-100 text-blue-700",
    "In Progress": "bg-yellow-100 text-yellow-700",
    Resolved: "bg-green-100 text-green-700",
  };
  return classes[status] || "bg-gray-100 text-gray-700";
};

export const getRoleBadgeClass = (role: string): string => {
  return role === "customer"
    ? "bg-purple-100 text-purple-700"
    : "bg-indigo-100 text-indigo-700";
};

export const getPriorityBadgeClass = (priority: string): string => {
  const classes: Record<string, string> = {
    "Not Set": "bg-gray-100 text-gray-700 border border-gray-200",
    Low: "bg-green-100 text-green-700 border border-green-200",
    Medium: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    High: "bg-orange-100 text-orange-700 border border-orange-200",
    Urgent: "bg-red-100 text-red-700 border border-red-200",
  };
  return classes[priority] || "bg-gray-100 text-gray-700";
};
