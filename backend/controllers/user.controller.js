const User = require("../models/User");
const UserHistory = require("../models/userHistory");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Đăng ký
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email đã tồn tại
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Tạo user mới
    user = new User({
      name,
      email,
      password,
      image: "",
      role: "user"
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
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email tồn tại
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    // Kiểm tra tài khoản bị khóa
    if (user.isLocked) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    // Kiểm tra password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    // Kiểm tra role admin nếu đăng nhập từ admin panel
    if (req.headers["x-app-type"] === "admin" && user.role !== "admin") {
      return res.status(403).json({ message: "Bạn không có quyền truy cập admin panel" });
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
      { expiresIn: "7d" },
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
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy thông tin cá nhân
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Không thể lấy thông tin cá nhân" });
  }
};

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    // Nếu đổi email, kiểm tra trùng
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: "Email đã tồn tại" });
      user.email = email;
    }
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    // Nếu có file upload thì cập nhật image
    if (req.file) {
      user.image = req.file.path.replace('uploads/', '/api/uploads/');
    }
    await user.save();
    res.json({ message: "Cập nhật thành công", ...user.toObject() });
  } catch (err) {
    res.status(500).json({ message: "Cập nhật thất bại" });
  }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ message: "Đổi mật khẩu thất bại" });
  }
};

// Lấy danh sách người dùng (admin)
exports.getUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới được phép!' });
    }
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng" });
  }
};

// Tạo người dùng mới (admin)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo người dùng mới
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      image: ""
    });

    await newUser.save();

    // Trả về thông tin người dùng (không bao gồm mật khẩu)
    const userResponse = newUser.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo người dùng mới" });
  }
};

// Cập nhật thông tin người dùng (admin)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isLocked } = req.body;

    // Kiểm tra nếu người dùng hiện tại là admin và đang cố gắng sửa một admin khác
    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(id);

    if (
      currentUser.role === "admin" &&
      targetUser.role === "admin" &&
      currentUser._id.toString() !== targetUser._id.toString()
    ) {
      return res.status(403).json({ message: "Không thể chỉnh sửa tài khoản admin khác" });
    }

    const updateFields = { name, email, role };
    if (typeof isLocked === 'boolean') updateFields.isLocked = isLocked;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật thông tin người dùng" });
  }
};

// Xóa người dùng (admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra nếu người dùng hiện tại là admin và đang cố gắng xóa một admin khác
    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(id);

    if (currentUser.role === "admin" && targetUser.role === "admin") {
      return res.status(403).json({ message: "Không thể xóa tài khoản admin khác" });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa người dùng" });
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

// Lưu lịch sử chỉnh sửa
exports.saveUserHistory = async (req, res) => {
  try {
    const { userId, changes } = req.body;
    const historyEntry = new UserHistory({
      userId,
      updatedBy: req.user.id,
      changes,
    });
    await historyEntry.save();
    res.json(historyEntry);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lưu lịch sử chỉnh sửa" });
  }
};

// Lấy lịch sử chỉnh sửa của một user
exports.getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await UserHistory.find({ userId })
      .populate('updatedBy', 'name email')
      .sort({ updatedAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy lịch sử chỉnh sửa" });
  }
};
