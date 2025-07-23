
const Chat = require('../models/Chat');

// Lấy tất cả các phiên chat, sắp xếp theo thời gian mới nhất
exports.getAllChats = async (req, res) => {
    try {
        const chats = await Chat.find().sort({ updatedAt: -1 });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

// Lấy chi tiết một phiên chat
exports.getChatByRoomId = async (req, res) => {
    try {
        const chat = await Chat.findOne({ roomId: req.params.roomId });
        if (!chat) {
            return res.status(404).json({ message: 'Không tìm thấy cuộc trò chuyện' });
        }
        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

// Cập nhật trạng thái (ví dụ: kết thúc chat)
exports.updateChatStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const chat = await Chat.findOneAndUpdate(
            { roomId: req.params.roomId },
            { status: status },
            { new: true }
        );
        if (!chat) {
            return res.status(404).json({ message: 'Không tìm thấy cuộc trò chuyện' });
        }
        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};