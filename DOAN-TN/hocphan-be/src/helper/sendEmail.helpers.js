const nodemailer = require('nodemailer');

const  sendEmail = async (email, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SEND_MAIL_EMAIL,
        pass: process.env.SEND_MAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.SEND_MAIL_EMAIL,
      to: email,
      subject,
      html
    });

    console.log(` Gửi email thành công đến ${email}`);
  } catch (error) {
    console.error(` Lỗi gửi email đến ${email}:`, error.message);
  }
};

module.exports= sendEmail;