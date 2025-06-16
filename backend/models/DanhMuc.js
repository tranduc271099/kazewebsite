const mongoose = require('mongoose');

const DanhMucSchema = new mongoose.Schema({
    ten: {
        type: String,
        required: true,
        trim: true
    },
    moTa: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DanhMuc', DanhMucSchema);
