const html = (orderCode, items, totalPrice,finalPrice, discountValue, shipping, paymentMethod) => {

    const itemsRows = items.map(item => {
        const firstImage = item.product.images[0] 
         
        return `
            <tr>
                <td style="padding:8px;border:1px solid #eee;text-align:center;">
                    <img src="${firstImage}" alt="${item.product.name}" style="width:60px;height:auto;border-radius:4px;" />
                </td>
                <td style="padding:8px;border:1px solid #eee;">
                    ${item.product.name} <br/>
                    <small style="color:#888;">Dung tích: ${item.volume}ml</small>
                </td>
                <td style="padding:8px;border:1px solid #eee;text-align:center;">${item.quantity}</td>
                <td style="padding:8px;border:1px solid #eee;text-align:right;">${item.price.toLocaleString()}₫</td>
            </tr>
        `;
    }).join("");

    const htmlSendMail = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Xác Nhận Đơn Hàng</title>
        <style>
            body { background-color: #f8f8f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .container {
                max-width: 650px;
                margin: 40px auto;
                background-color: #fff;
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 6px 20px rgba(0,0,0,0.1);
            }
            h1 { font-size: 24px; color: #333; margin-bottom: 8px; }
            p { color: #555; font-size: 14px; }
            table { border-collapse: collapse; width: 100%; margin-top: 16px; }
            th { background: #f4f4f4; padding: 8px; border: 1px solid #eee; font-size: 14px; }
            td { padding: 8px; border: 1px solid #eee; font-size: 14px; }
            .total { font-weight: bold; font-size: 16px; text-align: right; }
            .note { margin-top: 20px; font-size: 13px; color: #888; }
        </style>
    </head>
    <body>
        <div class="container">
            <p>Cảm ơn bạn đã đặt hàng! Dưới đây là thông tin đơn hàng của bạn:</p>
            <p><strong>Mã đơn hàng:</strong> ${orderCode}</p>
             <p><strong>Phương thức thanh toán:</strong> ${paymentMethod}</p>
            <table>
                <thead>
                    <tr>
                        <th>Ảnh</th>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Giá</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRows}
                    <tr>
                        <td colspan="3" class="total">Tạm tính:</td>
                        <td class="total">${totalPrice.toLocaleString()}₫</td>
                    </tr>
                    <tr>
                        <td colspan="3" class="total">Giảm giá:</td>
                        <td class="total" style="color:red;">- ${discountValue.toLocaleString()}₫</td>
                    </tr>
                    <tr>
                        <td colspan="3" class="total">Phí ship:</td>
                        <td class="total">${shipping.toLocaleString()}₫</td>
                    </tr>
                    <tr>
                        <td colspan="3" class="total">Tổng cộng:</td>
                        <td class="total" style="color:#2e7d32;">${finalPrice.toLocaleString()}₫</td>
                    </tr>
                </tbody>
            </table>
            <p class="note">Chúng tôi sẽ giao hàng sớm nhất có thể. Xin cảm ơn!</p>
        </div>
    </body>
    </html>
    `;
    return htmlSendMail;
};

module.exports= html;