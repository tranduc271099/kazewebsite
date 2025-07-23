
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// Lấy tất cả các phiên chat
router.get('/', chatController.getAllChats);

// Lấy một phiên chat cụ thể bằng roomId
router.get('/:roomId', chatController.getChatByRoomId);

// Cập nhật trạng thái của một phiên chat
router.put('/:roomId/status', chatController.updateChatStatus);

module.exports = router;