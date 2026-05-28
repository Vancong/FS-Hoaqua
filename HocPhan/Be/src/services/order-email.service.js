const sendEmail = require('../helper/sendEmail.helpers');
const htmlOrderInvoice = require('../helper/htmlOrderInvoice');
const WebSiteInfoDtb = require('../models/WebSiteInfo.Model');

const sendOrderInvoiceEmail = async (order, toEmail) => {
    const email = (toEmail || order.email || '').trim();
    if (!email) {
        console.warn('[OrderEmail] Không có email để gửi hóa đơn:', order.orderCode);
        return;
    }

    try {
        const websiteInfo = await WebSiteInfoDtb.findOne().lean();
        const shopName = (websiteInfo?.name || '').trim() || 'Fruit Shop';

        const html = htmlOrderInvoice(order, { shopName });
        await sendEmail(
            email,
            `[${shopName}] Hóa đơn đơn hàng ${order.orderCode}`,
            html,
            shopName
        );
        console.log(`[OrderEmail] Đã gửi hóa đơn ${order.orderCode} → ${email}`);
    } catch (err) {
        console.error(`[OrderEmail] Gửi hóa đơn ${order.orderCode} thất bại:`, err.message);
    }
};

module.exports = { sendOrderInvoiceEmail };
