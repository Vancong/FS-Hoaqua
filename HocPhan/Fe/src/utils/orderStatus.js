export const getStatusLabel = (status) => {
  const labels = {
    pending: "Chờ xác nhận",
    awaiting_payment: "Chờ thanh toán",
    confirmed: "Đã xác nhận",
    shipping: "Đang giao",
    completed: "Giao hàng thành công",
    delivered: "Giao hàng thành công",
    cancelled: "Đã hủy",
    refunded: "Đã hoàn tiền",
    refund_pending: "Đang hoàn tiền"
  };
  return labels[status] || status;
};
