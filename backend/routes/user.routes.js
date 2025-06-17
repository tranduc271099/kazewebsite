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
  saveUserHistory,
  getUserHistory,
} = require("../controllers/user.controller");
const auth = require("../middleware/auth");

// Đăng ký và đăng nhập
router.post("/register", register);
router.post("/login", login);

// Thông tin cá nhân
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

// Đổi mật khẩu
router.put("/profile/password", auth, changePassword);

// API quản lý người dùng (chỉ admin)
router.get("/admin/users", auth, getUsers);
router.post("/admin/users", auth, createUser);
router.put("/admin/users/:id", auth, updateUser);
router.delete("/admin/users/:id", auth, deleteUser);
router.get("/admin/users/:userId/history", auth, getUserHistory);
router.post("/admin/user-history", auth, saveUserHistory);

module.exports = router;
