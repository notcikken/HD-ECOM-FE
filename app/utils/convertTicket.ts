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

export const getCategoryLabel = (categoryId: number | string): string => {
  const id = typeof categoryId === "string" ? parseInt(categoryId) : categoryId;
  return CATEGORY_MAP[id] || `Unknown (${categoryId})`;
};

export const getStatusLabel = (statusId: number | string): string => {
  const id = typeof statusId === "string" ? parseInt(statusId) : statusId;
  return STATUS_MAP[id] || `Unknown (${statusId})`;
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
  return role === "pelanggan"
    ? "bg-purple-100 text-purple-700"
    : "bg-indigo-100 text-indigo-700";
};
