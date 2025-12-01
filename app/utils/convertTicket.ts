export const CATEGORY_MAP: Record<number, string> = {
  1: "Akun & Keamanan",
  2: "Pembayaran",
  3: "Pengiriman",
  4: "Pengembalian",
  5: "Promo & Voucher",
  6: "Teknis Aplikasi",
  7: "Produk",
};

export const getCategoryLabel = (categoryId: number | string): string => {
  const id = typeof categoryId === "string" ? parseInt(categoryId) : categoryId;
  return CATEGORY_MAP[id] || `Unknown (${categoryId})`;
};
