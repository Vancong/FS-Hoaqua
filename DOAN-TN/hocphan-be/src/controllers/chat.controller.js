const asyncHandler = require('express-async-handler');
const chatService = require('../services/chat.service');

// POST /api/chat/message
module.exports.sendMessage = asyncHandler(async (req, res) => {
  const { text, sessionId, recentMessages } = req.body;
  // Không cần userId nữa vì không lưu vào DB

  if (!sessionId) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'sessionId là bắt buộc'
    });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Tin nhắn không được để trống'
    });
  }

  // Xử lý message và trả về AI response (không lưu vào DB)
  const result = await chatService.processMessageWithoutSaving(sessionId, text.trim(), recentMessages || []);

  // Đảm bảo result có đầy đủ dữ liệu
  if (!result || !result.botText) {
    return res.status(500).json({
      status: 'ERROR',
      message: 'Lỗi khi xử lý tin nhắn'
    });
  }

  return res.status(200).json({
    status: 'OK',
    message: 'Xử lý tin nhắn thành công',
    data: {
      botMessage: result.botText,
      products: result.products || [],
      extractedFilters: result.extractedFilters || {}
    }
  });
});

// Route /history đã được xóa vì chat history hiện được lưu ở localStorage trên frontend


