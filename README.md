# HocPhan (FE + BE)

Dự án gồm:

- **Backend**: `HocPhan/Be` (Node.js/Express + MongoDB)
- **Frontend**: `HocPhan/Fe` (React)

> Lưu ý bảo mật: **không push file `.env` lên GitHub**. Hãy tạo `.env.example` (không có secret) và thêm `.env` vào `.gitignore`.

## Yêu cầu

- Node.js **>= 18**
- npm (đi kèm Node.js)
- MongoDB (Atlas hoặc local)

## Cấu hình môi trường

### Backend (`HocPhan/Be/.env`)

Tạo file `HocPhan/Be/.env` theo mẫu (điền giá trị thật của bạn):

```env
PORT=3001
NODE_ENV=development

MONGO_URL=
ACCESS_TOKEN=
REFRESH_TOKEN=

# Cloudinary (upload ảnh)
CLOUD_NAME=
API_KEY=
API_SECRET=

# VNPay (nếu dùng)
VNP_TMN_CODE=
VNP_HASH_SECRET=
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3001/api/payment/vnpay/return
FRONTEND_URL=http://localhost:3000

# Gửi mail (OTP / hóa đơn)
SEND_MAIL_EMAIL=
SEND_MAIL_PASSWORD=
```

### Frontend (`HocPhan/Fe/.env`)

Tạo file `HocPhan/Fe/.env`:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Chạy dự án (Windows / PowerShell)

Mở **2 terminal**.

### 1) Chạy Backend

```powershell
cd e:\JOB\HocPhan\Be
npm install
npm run dev
```

Backend mặc định chạy: `http://localhost:3001`

### 2) Chạy Frontend

```powershell
cd e:\JOB\HocPhan\Fe
npm install
npm start
```

Frontend mặc định chạy: `http://localhost:3000`

## Ghi chú nhanh

- **COD**: `paymentMethod: "cod"` → `isPaid: false`
- **VNPay**: FE gọi API tạo URL → redirect sang VNPay → BE nhận return/ipn
- **Email hóa đơn**: backend sẽ gửi mail hóa đơn khi đặt COD thành công hoặc khi VNPay thanh toán thành công

