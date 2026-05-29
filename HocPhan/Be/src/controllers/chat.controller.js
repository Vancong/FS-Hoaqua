const asyncHandler = require('express-async-handler');
const ChatService = require('../services/chat.service');

module.exports.sendMessage = asyncHandler(async (req, res) => {
    const { text, sessionId, recentMessages } = req.body;

    if (!sessionId) {
        return res.status(400).json({
            status: 'ERROR',
            message: 'sessionId là bắt buộc',
        });
    }

    if (!text || !text.trim()) {
        return res.status(400).json({
            status: 'ERROR',
            message: 'Tin nhắn không được để trống',
        });
    }

    const response = await ChatService.sendMessage({
        text: text.trim(),
        sessionId,
        recentMessages: recentMessages || [],
    });

    return res.status(200).json(response);
});
