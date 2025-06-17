const mongoose = require('mongoose');

const userHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    changes: {
        name: String,
        email: String,
        role: String,
        isLocked: Boolean
    }
});

module.exports = mongoose.model('UserHistory', userHistorySchema); 