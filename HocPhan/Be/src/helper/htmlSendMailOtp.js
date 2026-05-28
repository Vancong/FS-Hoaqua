const htmlOtp = (otp, title, note) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:Segoe UI,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;padding:40px;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
    <h1 style="color:#14532d;font-size:24px;margin:0 0 8px;">${title}</h1>
    <p style="color:#64748b;margin:0 0 24px;">${note || 'Fruit Shop'}</p>
    <div style="background:#f0fdf4;border:2px dashed #22c55e;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#15803d;">${otp}</span>
    </div>
    <p style="color:#475569;line-height:1.6;font-size:14px;">
      Mã OTP có hiệu lực trong <strong>5 phút</strong>. Không chia sẻ mã này với bất kỳ ai.
    </p>
    <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
      Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
    </p>
  </div>
</body>
</html>
`;

module.exports = htmlOtp;
