
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    author: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    clientUsername: { type: String, required: true },
    status: {
        type: String,
        enum: ['mới', 'đang diễn ra', 'đã kết thúc'],
        default: 'mới'
    },
    messages: [messageSchema],
    adminUsername: { type: String } // Tên admin đã tham gia
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Chat', chatSchema);