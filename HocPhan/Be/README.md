# HocPhan — Backend (`HocPhan/Be`)

API học phần Backend — module **User** và **Product**.

## Cấu trúc

```
src/
├── config/database.js
├── models/User.Model.js, Product.Model.js
├── routes/user.router.js
├── controllers/user.controller.js
├── services/user.Service.js, JwtService.js
├── middleware/
├── validate/validateAll.js
└── index.js
```

## Chạy project

```bash
cd HocPhan/Be
npm install
copy .env.example .env
npm run dev
```

## API Order & Thanh toán

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/order/create/:userId` | Tạo đơn (COD / VNPay / PayPal) |
| GET | `/api/order/my-order/:userId` | Đơn của tôi |
| GET | `/api/order/my-order/detail/:userId/:orderCode` | Chi tiết đơn |
| POST | `/api/payment/vnpay/create-url/:userId` | Lấy URL thanh toán VNPay |
| GET | `/api/payment/vnpay/return` | VNPay redirect sau thanh toán |
| GET | `/api/payment/vnpay/ipn` | VNPay IPN (cấu hình trên portal VNPay) |

**COD:** `paymentMethod: "cod"` — `isPaid: false`, thu tiền khi giao hàng.

**VNPay:** `paymentMethod: "vnpay"` → gọi `create-url` → chuyển sang cổng VNPay.

Cấu hình `.env`:
```
VNP_TMN_CODE=
VNP_HASH_SECRET=
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3001/api/payment/vnpay/return
FRONTEND_URL=http://localhost:3000
```

## API Product

| Method | Endpoint | Quyền |
|--------|----------|--------|
| GET | `/api/products` | Public |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Admin + upload `image` |
| PUT | `/api/products/:id` | Admin + upload `image` (tùy chọn) |
| DELETE | `/api/products/:id` | Admin |

Header admin: `token: Bearer <access_token>`

POST/PUT dùng `multipart/form-data`, field ảnh: `image`.

## API User

| Method | Endpoint |
|--------|----------|
| POST | `/api/user/sign-up` |
| POST | `/api/user/sign-in` |
| POST | `/api/user/log-out` |
| POST | `/api/user/refresh-token` |
| GET | `/api/user/get-detail/:id` |
| GET | `/api/user/getAll` (admin) |
| PUT | `/api/user/update-user/:userId` |
| POST | `/api/user/change-password/:userId` |
| DELETE | `/api/user/delete-user/:id` (admin) |
