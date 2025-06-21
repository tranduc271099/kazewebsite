const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');

// Đăng ký
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

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

        // Kiểm tra tài khoản bị khóa
        if (user.isLocked) {
            return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
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
                user.image = result.secure_url;
                await user.save();
                return res.json({ message: 'Cập nhật thành công', ...user.toObject() });
            } catch (error) {
                console.error('Lỗi upload ảnh:', error);
                return res.status(500).json({ message: 'Lỗi upload ảnh', error: error.message });
            }
        }
        await user.save();
        res.json({ message: 'Cập nhật thành công', ...user.toObject() });
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

// Lấy danh sách tất cả user (chỉ admin)
exports.getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới được phép!' });
        }
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Không thể lấy danh sách user' });
    }
};

// Khóa/mở khóa user (chỉ admin, không cho phép khóa admin)
exports.lockUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới được phép!' });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Không thể khóa admin khác!' });
        }
        user.isLocked = !user.isLocked;
        await user.save();
        res.json({ message: user.isLocked ? 'Đã khóa user' : 'Đã mở khóa user', isLocked: user.isLocked });
    } catch (err) {
        res.status(500).json({ message: 'Thao tác thất bại' });
    }
};