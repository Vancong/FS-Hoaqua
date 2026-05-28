# hocphan-be

Backend học phần — API website bán nước hoa. Cấu trúc giống đồ án `Do_An_Be`: **routes → controllers → services → models**.

## Cấu trúc thư mục

```
src/
├── config/          # Kết nối MongoDB
├── models/          # Mongoose schemas
├── routes/          # Định nghĩa API endpoints
├── controllers/     # Xử lý request/response
├── services/        # Business logic
├── middleware/      # Auth, upload, error handler
├── validate/        # Joi validation
├── helper/          # Tiện ích (email, cloudinary, pagination...)
└── index.js         # Entry point
```

## API modules

| Prefix | Mô tả |
|--------|--------|
| `/api/user` | Đăng ký, đăng nhập, JWT |
| `/api/product` | Sản phẩm |
| `/api/brand` | Thương hiệu |
| `/api/note`, `/api/note-group` | Mùi / nhóm hương |
| `/api/cart` | Giỏ hàng |
| `/api/order` | Đơn hàng |
| `/api/voucher` | Mã giảm giá |
| `/api/favorite` | Yêu thích |
| `/api/payment` | PayPal config |
| `/api/forgot-password` | Quên mật khẩu |
| `/api/website-info` | Thông tin website |
| `/api/stats` | Thống kê admin |
| `/api/chat` | Chatbot AI |

## Cài đặt

```bash
cd hocphan-be
npm install
cp .env.example .env
# Chỉnh MONGO_URL và các biến trong .env
npm run dev
```

Server mặc định: `http://localhost:3001`

## Công nghệ

Node.js, Express, MongoDB, Mongoose, JWT, Cloudinary, Nodemailer, OpenAI (chat)
