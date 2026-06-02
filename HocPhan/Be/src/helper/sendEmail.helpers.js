const createError = require('./createError');

const sendEmail = async (email, subject, html, fromName) => {
    const apiKey = process.env.BREVO_API_KEY;
    const mailSender = process.env.SEND_MAIL_EMAIL || 'giabao27526@gmail.com';

    if (!apiKey) {
        throw createError(
            500,
            'Chưa cấu hình API Key gửi mail (BREVO_API_KEY trong .env)'
        );
    }

    const displayName = (fromName || '').trim() || 'Fruit Shop';

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: displayName, email: mailSender },
                to: [{ email: email }],
                subject: subject,
                htmlContent: html
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `HTTP status ${response.status}`);
        }

        console.log(`[Brevo API] Đã gửi hóa đơn thành công đến: ${email}`);
    } catch (error) {
        console.error('[Brevo API] Lỗi gửi mail:', error.message);
        throw createError(500, `Gửi mail thất bại: ${error.message}`);
    }
};

module.exports = sendEmail;
