const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// Guest và user đều có thể sử dụng, nên tạm thời không bắt buộc auth
// Sau này nếu cần gắn với userId thì có thể thêm authUserMiddleware

// Gửi tin nhắn mới
router.post('/message', chatController.sendMessage);

// Route /history đã được xóa vì chat history hiện được lưu ở localStorage trên frontend

module.exports = router;


