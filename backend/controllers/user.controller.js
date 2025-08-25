const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');
const UserHistory = require('../models/UserHistory');
const Bill = require('../models/Bill/BillUser'); // Import Bill model
const { notifyClientDataUpdate, EVENT_TYPES } = require('../utils/realTimeNotifier');

// Đăng ký
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Kiểm tra email đã tồn tại
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        // Tạo user mới
        user = new User({
            name,
            email,
            password,
            phone,
            image: ""
        });

        // Mã hóa password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Lưu user
        await user.save();

        // Tạo token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra email tồn tại
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email không tồn tại' });
        }

        // Kiểm tra password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu không đúng' });
        }

        // Kiểm tra role admin nếu đăng nhập từ admin panel
        if (req.headers['x-app-type'] === 'admin' && user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập admin panel' });
        }

        // Tạo token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        image: user.image || null
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy thông tin cá nhân
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Không thể lấy thông tin cá nhân' });
    }
};

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address, email } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        // Nếu đổi email, kiểm tra trùng
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) return res.status(400).json({ message: 'Email đã tồn tại' });
            user.email = email;
        }
        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.gender = req.body.gender || user.gender; // Add gender update
        user.dob = req.body.dob || user.dob;         // Add dob update
        // Nếu có file upload thì upload lên cloudinary và cập nhật image
        if (req.file) {
            // Bọc upload_stream vào Promise
            const uploadToCloudinary = (fileBuffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'avatars', resource_type: 'image' },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    stream.end(fileBuffer);
                });
            };

            try {
                const result = await uploadToCloudinary(req.file.buffer);
                user.image = result.secure_url; // Chỉ lưu URL Cloudinary
                await user.save();
                // Lưu lịch sử chỉnh sửa
                await UserHistory.create({
                    userId: user._id,
                    updatedBy: req.user.id,
                    changes: {
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        gender: user.gender, // Add gender to history
                        dob: user.dob,       // Add dob to history
                    },
                    updatedAt: new Date()
                });
                // Đảm bảo trả về user mới nhất với image là Cloudinary URL
                const updatedUser = await User.findById(user._id).select('-password');
                return res.json({ message: 'Cập nhật thành công', ...updatedUser.toObject() });
            } catch (error) {
                console.error('Lỗi upload ảnh:', error);
                return res.status(500).json({ message: 'Lỗi upload ảnh', error: error.message });
            }
        }
        await user.save();
        // Lưu lịch sử chỉnh sửa
        await UserHistory.create({
            userId: user._id,
            updatedBy: req.user.id,
            changes: {
                name: user.name,
                email: user.email,
                role: user.role,
                gender: user.gender, // Add gender to history
                dob: user.dob,       // Add dob to history
            },
            updatedAt: new Date()
        });
        // Nếu không upload ảnh mới, chỉ trả về image là URL Cloudinary (nếu có), không bao giờ trả về đường dẫn cục bộ
        let userObj = user.toObject();
        if (userObj.image && !userObj.image.startsWith('http')) {
            // Nếu image không phải URL Cloudinary, xóa trường image để frontend dùng ảnh mặc định
            userObj.image = '';
        }
        res.json({ message: 'Cập nhật thành công', ...userObj });
    } catch (err) {
        res.status(500).json({ message: 'Cập nhật thất bại', error: err.message });
    }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        // Kiểm tra mật khẩu hiện tại
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        // Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Đổi mật khẩu thất bại' });
    }
};

// Lấy thông tin user bằng ID (chỉ admin)
exports.getUserById = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới được phép!' });
        }

        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Calculate total spent for this user
        const totalSpentResult = await Bill.aggregate([
            { $match: { nguoi_dung_id: user._id, trang_thai: 'hoàn thành' } },
            { $group: { _id: null, total: { $sum: '$tong_tien' } } }
        ]);

        const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;

        res.json({ ...user.toObject(), totalSpent });
    } catch (err) {
        console.error('Error in getUserById:', err);
        res.status(500).json({ message: 'Không thể lấy thông tin người dùng', error: err.message });
    }
};

// Lấy danh sách tất cả user (chỉ admin)
exports.getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới được phép!' });
        }

        const { role, search } = req.query;
        const filter = {};

        if (role && (role === 'user' || role === 'admin')) {
            filter.role = role;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter).select('-password');

        // Calculate total spent for each user
        const usersWithTotalSpent = await Promise.all(users.map(async (user) => {
            const totalSpent = await Bill.aggregate([
                { $match: { nguoi_dung_id: user._id, trang_thai: 'hoàn thành' } },
                { $group: { _id: null, total: { $sum: '$tong_tien' } } }
            ]);
            return {
                ...user.toObject(),
                totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0
            };
        }));

        res.json(usersWithTotalSpent);
    } catch (err) {
        console.error('Error in getAllUsers:', err);
        res.status(500).json({ message: 'Không thể lấy danh sách user', error: err.message });
    }
};

// Lấy lịch sử chỉnh sửa user (chỉ admin)
exports.getUserHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('API getUserHistory called with userId:', userId);
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log('userId không hợp lệ:', userId);
            return res.status(400).json({ message: 'userId không hợp lệ' });
        }
        const objectId = new mongoose.Types.ObjectId(userId);
        const history = await UserHistory.find({ userId: objectId })
            .populate('updatedBy', 'name email')
            .sort({ updatedAt: -1 }); // Sắp xếp mới nhất lên đầu
        console.log('History found:', history.length);
        if (!history || history.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy lịch sử chỉnh sửa cho user này' });
        }
        res.json(history);
    } catch (err) {
        console.error('Lỗi getUserHistory:', err);
        res.status(500).json({ message: 'Không thể lấy lịch sử chỉnh sửa', error: err.message });
    }
};