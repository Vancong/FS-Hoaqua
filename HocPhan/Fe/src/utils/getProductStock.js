/** Tồn kho theo kg */
export const getProductStock = (product) => {
  if (!product) return 0;
  const stock = Number(product.stock);
  return Number.isFinite(stock) && stock >= 0 ? stock : 0;
};
