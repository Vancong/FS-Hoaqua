const nodemailer = require('nodemailer');
const createError = require('./createError');

const sendEmail = async (email, subject, html, fromName) => {
    const mailUser = process.env.SEND_MAIL_EMAIL;
    const mailPass = process.env.SEND_MAIL_PASSWORD;

    if (!mailUser || !mailPass || mailUser.includes('your_email')) {
        throw createError(
            500,
            'Chưa cấu hình email gửi OTP (SEND_MAIL_EMAIL, SEND_MAIL_PASSWORD trong .env)'
        );
    }

    const displayName = (fromName || '').trim() || 'Fruit Shop';

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: mailUser, pass: mailPass },
    });

    await transporter.sendMail({
        from: `"${displayName}" <${mailUser}>`,
        to: email,
        subject,
        html,
    });
};

module.exports = sendEmail;
