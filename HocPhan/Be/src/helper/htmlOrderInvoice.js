const formatMoney = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatAddress = (address) => {
    if (!address) return '—';
    const ward = typeof address.ward === 'object' ? address.ward?.name : address.ward;
    const district = typeof address.district === 'object' ? address.district?.name : address.district;
    const province = typeof address.province === 'object' ? address.province?.name : address.province;
    return [address.detail, ward, district, province].filter(Boolean).join(', ') || '—';
};

const paymentLabel = (method, isPaid) => {
    if (method === 'cod') return 'Thanh toán khi nhận hàng (COD)';
    if (method === 'vnpay') return isPaid ? 'VNPay — Đã thanh toán' : 'VNPay — Chờ thanh toán';
    return method || '—';
};

const statusLabel = (status) => {
    const map = {
        pending: 'Chờ xác nhận',
        awaiting_payment: 'Chờ thanh toán',
        confirmed: 'Đã xác nhận',
        shipping: 'Đang giao',
        delivered: 'Đã giao',
        cancelled: 'Đã hủy',
    };
    return map[status] || status;
};

const renderProductItems = (items = []) =>
    items
        .map(
            (item, i) => `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #e8f5e9;">
          <tr>
            <td style="padding:14px 16px 8px;font-size:15px;font-weight:bold;color:#1e293b;line-height:1.4;">
              ${i + 1}. ${item.name || 'Sản phẩm'}
            </td>
          </tr>
          <tr>
            <td style="padding:0 16px 14px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-size:13px;color:#64748b;line-height:1.7;vertical-align:top;">
                    Số lượng: <strong style="color:#1e293b;">${item.quantity} kg</strong><br/>
                    Đơn giá: <strong style="color:#1e293b;">${formatMoney(item.price)}/kg</strong>
                  </td>
                  <td style="font-size:15px;font-weight:bold;color:#16a34a;text-align:right;vertical-align:top;white-space:nowrap;padding-left:12px;">
                    ${formatMoney(item.price * item.quantity)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>`
        )
        .join('');

const htmlOrderInvoice = (order, opts = {}) => {
    const shopName = (opts.shopName || '').trim() || 'Fruit Shop';
    const productsHtml = renderProductItems(order.items);

    const createdAt = order.createdAt
        ? new Date(order.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
        : new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    const infoRow = (label, value) => `
      <tr>
        <td style="padding:6px 10px 6px 0;color:#64748b;font-size:14px;width:120px;vertical-align:top;">${label}:</td>
        <td style="padding:6px 0;font-size:14px;color:#1e293b;vertical-align:top;line-height:1.5;">${value}</td>
      </tr>`;

    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hóa đơn ${order.orderCode}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0fdf4;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f0fdf4;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td bgcolor="#16a34a" style="background-color:#16a34a;padding:24px 28px;">
              <p style="margin:0 0 6px;font-size:22px;font-weight:bold;color:#ffffff;line-height:1.3;">${shopName}</p>
              <p style="margin:0;font-size:14px;color:#dcfce7;line-height:1.4;">Hóa đơn đặt hàng thành công</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 20px;">
              <p style="margin:0 0 6px;font-size:14px;color:#64748b;line-height:1.5;">
                Mã đơn: <strong style="color:#14532d;">${order.orderCode}</strong>
              </p>
              <p style="margin:0 0 20px;font-size:14px;color:#64748b;line-height:1.5;">Ngày đặt: ${createdAt}</p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                ${infoRow('Người nhận', `<strong>${order.name}</strong>`)}
                ${infoRow('Điện thoại', order.phone)}
                ${infoRow('Địa chỉ', formatAddress(order.address))}
                ${infoRow('Thanh toán', paymentLabel(order.paymentMethod, order.isPaid))}
                ${infoRow('Trạng thái', statusLabel(order.status))}
              </table>

              <!-- Sản phẩm - layout dạng thẻ, ổn định trên mobile & desktop -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e8f5e9;border-radius:8px;overflow:hidden;margin-bottom:20px;">
                <tr>
                  <td bgcolor="#f0fdf4" style="background-color:#f0fdf4;padding:12px 16px;font-size:13px;font-weight:bold;color:#14532d;border-bottom:1px solid #bbf7d0;">
                    Chi tiết sản phẩm
                  </td>
                </tr>
                <tr>
                  <td style="padding:0;">
                    ${productsHtml}
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#64748b;">Tạm tính</td>
                  <td style="padding:6px 0;font-size:14px;color:#1e293b;text-align:right;white-space:nowrap;">${formatMoney(order.totalPrice)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#64748b;">Phí vận chuyển</td>
                  <td style="padding:6px 0;font-size:14px;color:#1e293b;text-align:right;white-space:nowrap;">${formatMoney(order.shipping)}</td>
                </tr>
                ${
                    order.discountValue
                        ? `<tr>
                  <td style="padding:6px 0;font-size:14px;color:#64748b;">Giảm giá</td>
                  <td style="padding:6px 0;font-size:14px;color:#ef4444;text-align:right;white-space:nowrap;">-${formatMoney(order.discountValue)}</td>
                </tr>`
                        : ''
                }
                <tr>
                  <td style="padding:14px 0 0;font-size:17px;font-weight:bold;color:#14532d;">Tổng thanh toán</td>
                  <td style="padding:14px 0 0;font-size:17px;font-weight:bold;color:#16a34a;text-align:right;white-space:nowrap;">${formatMoney(order.finalPrice)}</td>
                </tr>
              </table>

              ${
                  order.note
                      ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:16px;">
                <tr>
                  <td style="padding:12px 14px;background-color:#f8faf7;border-radius:8px;font-size:13px;color:#475569;line-height:1.5;">
                    <strong>Ghi chú:</strong> ${order.note}
                  </td>
                </tr>
              </table>`
                      : ''
              }

              <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;text-align:center;line-height:1.5;">
                Cảm ơn bạn đã mua hàng tại ${shopName}!
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

module.exports = htmlOrderInvoice;
