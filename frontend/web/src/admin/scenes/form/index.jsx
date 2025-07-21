import { Box, Button, TextField, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from '../../UserContext';
import { useTheme, alpha } from '@mui/material/styles';

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    image: null,
    role: "",
    isLocked: false,
  });
  const [success, setSuccess] = useState("");
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const { setUser, user } = useUser();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios.get("http://localhost:5000/api/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setInitialValues({
        name: res.data.name || "",
        email: res.data.email || "",
        password: "",
        phone: res.data.phone || "",
        address: res.data.address || "",
        image: res.data.image || null,
        role: res.data.role || "user",
        isLocked: res.data.isLocked || false,
      });
      setPreview(res.data.image || null);
    });
  }, []);

  const handleImageChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreview(file ? URL.createObjectURL(file) : initialValues.image);
    setFieldValue("image", file);
  };

  const handleFormSubmit = async (values) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    if (values.password) formData.append("password", values.password);
    formData.append("phone", values.phone);
    formData.append("address", values.address);
    if (imageFile) formData.append("image", imageFile);
    else if (initialValues.image) formData.append("image", initialValues.image);
    await axios.put("http://localhost:5000/api/users/me", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      }
    });
    const updatedUser = await axios.get("http://localhost:5000/api/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUser(updatedUser.data);
    setSuccess("Cập nhật thông tin thành công!");
    window.location.reload();
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (!pwCurrent || !pwNew || !pwConfirm) {
      setPwError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError("Mật khẩu mới và xác nhận không khớp!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/users/change-password",
        { currentPassword: pwCurrent, newPassword: pwNew },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPwSuccess("Đổi mật khẩu thành công!");
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
    } catch (err) {
      setPwError(err.response?.data?.message || "Đổi mật khẩu thất bại!");
    }
  };

  let avatar = preview;
  if (!avatar) {
    if (user?.image) {
      if (user.image.startsWith('http')) avatar = user.image;
      else if (user.image.startsWith('/uploads/')) avatar = `http://localhost:5000${user.image}`;
      else if (user.image.startsWith('/api/uploads/')) avatar = `http://localhost:5000${user.image.replace('/api', '')}`;
      else avatar = `http://localhost:5000/${user.image}`;
    } else {
      avatar = '/assets/img/no-avatar.png';
    }
  }

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" sx={{ bgcolor: 'var(--page-bg, #f4f6f9)' }}>
      <Box
        sx={{
          width: { xs: '100%', sm: 420 },
          bgcolor: 'var(--card-bg, #fff)',
          borderRadius: 4,
          boxShadow: 3,
          p: { xs: 2, sm: 4 },
          mx: 2,
          border: '1px solid var(--card-border, #ececec)',
          color: 'var(--text-primary, #222)'
        }}
      >
        <Typography variant="h5" fontWeight={700} align="center" mb={1} sx={{ color: 'var(--text-primary, #222)' }}>
          Quản lý thông tin hồ sơ
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary, #888)' }} align="center" mb={3}>
          Để bảo mật tài khoản, hãy cập nhật thông tin chính xác
        </Typography>
        {success && <Box sx={{ color: 'var(--text-primary, #059669)' }} mb={2} textAlign="center">{success}</Box>}
        <Formik
          enableReinitialize
          onSubmit={handleFormSubmit}
          initialValues={initialValues}
          validationSchema={checkoutSchema}
        >
          {({ values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue }) => (
            <form onSubmit={handleSubmit}>
              <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Box
                  sx={{
                    position: 'relative',
                    width: 100,
                    height: 100,
                    mb: 1
                  }}
                >
                  <img
                    src={avatar}
                    alt="Avatar"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                  />
                  <label htmlFor="avatar-upload" style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: '#4fa3ff',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }} title="Đổi ảnh đại diện">
                    <svg width="18" height="18" fill="#fff" viewBox="0 0 24 24"><path d="M21.7 6.3l-4-4a1 1 0 0 0-1.4 0l-11 11A1 1 0 0 0 5 14v4a1 1 0 0 0 1 1h4a1 1 0 0 0 .7-.3l11-11a1 1 0 0 0 0-1.4zM7 17v-2.59l9-9L18.59 8l-9 9H7zm12.29-10.29l-1 1-2-2 1-1a.996.996 0 0 1 1.41 0l.59.59a.996.996 0 0 1 0 1.41z" /></svg>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => handleImageChange(e, setFieldValue)}
                    />
                  </label>
                </Box>
              </Box>
              <TextField
                fullWidth
                variant="outlined"
                type="text"
                label="Tên"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
                name="name"
                error={!!touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                sx={{ mb: 2, background: 'var(--input-bg, #fafbfc)', borderColor: 'var(--input-border, #e0e0e0)' }}
                InputLabelProps={{ style: { color: 'var(--text-secondary, #888)' } }}
                InputProps={{ style: { color: 'var(--text-primary, #222)', background: 'var(--input-bg, #fafbfc)', borderColor: 'var(--input-border, #e0e0e0)' } }}
              />
              <TextField
                fullWidth
                variant="outlined"
                type="email"
                label="Email"
                value={values.email}
                name="email"
                InputProps={{ readOnly: true, style: { color: 'var(--text-secondary, #888)', background: 'var(--input-bg, #fafbfc)' } }}
                disabled
                sx={{ mb: 2 }}
                InputLabelProps={{ style: { color: 'var(--text-secondary, #888)' } }}
              />
              <TextField
                fullWidth
                variant="outlined"
                type="text"
                label="Số điện thoại"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.phone}
                name="phone"
                error={!!touched.phone && !!errors.phone}
                helperText={touched.phone && errors.phone}
                sx={{ mb: 2, background: 'var(--input-bg, #fafbfc)', borderColor: 'var(--input-border, #e0e0e0)' }}
                InputLabelProps={{ style: { color: 'var(--text-secondary, #888)' } }}
                InputProps={{ style: { color: 'var(--text-primary, #222)', background: 'var(--input-bg, #fafbfc)', borderColor: 'var(--input-border, #e0e0e0)' } }}
              />
              <TextField
                fullWidth
                variant="outlined"
                type="text"
                label="Địa chỉ"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address}
                name="address"
                error={!!touched.address && !!errors.address}
                helperText={touched.address && errors.address}
                sx={{ mb: 2, background: 'var(--input-bg, #fafbfc)', borderColor: 'var(--input-border, #e0e0e0)' }}
                InputLabelProps={{ style: { color: 'var(--text-secondary, #888)' } }}
                InputProps={{ style: { color: 'var(--text-primary, #222)', background: 'var(--input-bg, #fafbfc)', borderColor: 'var(--input-border, #e0e0e0)' } }}
              />
              <TextField
                fullWidth
                variant="outlined"
                type="text"
                label="Vai trò"
                value={values.role === 'admin' ? 'admin' : 'user'}
                name="role"
                InputProps={{ readOnly: true, style: { color: 'var(--text-secondary, #888)', background: 'var(--input-bg, #fafbfc)' } }}
                disabled
                sx={{ mb: 2 }}
                InputLabelProps={{ style: { color: 'var(--text-secondary, #888)' } }}
              />
              <TextField
                fullWidth
                variant="outlined"
                type="text"
                label="Trạng thái"
                value={values.isLocked ? 'Bị khóa' : 'Hoạt động'}
                name="isLocked"
                InputProps={{ readOnly: true, style: { color: 'var(--text-secondary, #888)', background: 'var(--input-bg, #fafbfc)' } }}
                disabled
                sx={{ mb: 3 }}
                InputLabelProps={{ style: { color: 'var(--text-secondary, #888)' } }}
              />
              <Button
                type="submit"
                color="primary"
                variant="contained"
                fullWidth
                size="large"
                sx={{ borderRadius: 99, fontWeight: 700, py: 1.2, fontSize: 18, mt: 1, boxShadow: 2 }}
              >
                Lưu
              </Button>
            </form>
          )}
        </Formik>
        {/* FORM ĐỔI MẬT KHẨU */}
        <Box maxWidth={400} mx="auto" mt={4}>
          <Typography variant="h4" mb={2}>Đổi mật khẩu</Typography>
          {pwError && <Box color="error.main" mb={2}>{pwError}</Box>}
          {pwSuccess && <Box color="success.main" mb={2}>{pwSuccess}</Box>}
          <form onSubmit={handleChangePassword}>
            <TextField
              label="Mật khẩu hiện tại"
              type="password"
              fullWidth
              margin="normal"
              value={pwCurrent}
              onChange={e => setPwCurrent(e.target.value)}
              required
            />
            <TextField
              label="Mật khẩu mới"
              type="password"
              fullWidth
              margin="normal"
              value={pwNew}
              onChange={e => setPwNew(e.target.value)}
              required
            />
            <TextField
              label="Nhập lại mật khẩu mới"
              type="password"
              fullWidth
              margin="normal"
              value={pwConfirm}
              onChange={e => setPwConfirm(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Đổi mật khẩu
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  name: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  password: yup.string(),
  phone: yup.string(),
  address: yup.string(),
  image: yup.mixed(),
});

export default Form;
