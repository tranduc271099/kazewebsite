const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
    phone: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    address: String,
    image: { type: String, required: false },
    vouchers: [{ type: String }],
    gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'], required: false },
    dob: { type: Date, required: false },
    isActive: { type: Boolean, default: true }, // Add isActive field
    resetPasswordToken: { type: String }, // Token for password reset
    resetPasswordExpiry: { type: Date }, // Expiry time for reset token
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema);
