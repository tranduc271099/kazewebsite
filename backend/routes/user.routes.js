const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  lockUser,
} = require("../controllers/user.controller");
const auth = require("../middleware/auth");
const upload = require('../middleware/upload');

// Đăng ký và đăng nhập
router.post("/register", register);
router.post("/login", login);

// Thông tin cá nhân
router.get("/profile", auth, getProfile);
router.put("/profile", auth, upload.single('image'), updateProfile);

// Đổi mật khẩu
router.put("/profile/password", auth, changePassword);

// API quản lý người dùng (chỉ admin)
router.get("/admin/users", auth, getUsers);
router.post("/admin/users", auth, createUser);
router.put("/admin/users/:id", auth, updateUser);
router.delete("/admin/users/:id", auth, deleteUser);
router.put("/admin/users/:id/lock", auth, lockUser);

module.exports = router;
