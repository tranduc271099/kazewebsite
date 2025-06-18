import { Box, Button, TextField, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useState, useEffect } from "react";
import axios from "axios";

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    password: "",
    image: null,
  });
  const [success, setSuccess] = useState("");
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios.get("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setInitialValues({
        name: res.data.name || "",
        email: res.data.email || "",
        password: "",
        image: res.data.image || null,
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
    if (imageFile) formData.append("image", imageFile);
    else if (initialValues.image) formData.append("image", initialValues.image);
    await axios.put("/api/users/me", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      }
    });
    const updatedUser = await axios.get("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    localStorage.setItem("user", JSON.stringify(updatedUser.data));
    setSuccess("Cập nhật thông tin thành công!");
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
        "/api/users/change-password",
        { currentPassword: pwCurrent, newPassword: pwNew },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPwSuccess("Đổi mật khẩu thành công!");
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
    } catch (err) {
      setPwError(err.response?.data?.message || "Đổi mật khẩu thất bại!");
    }
  };

  return (
    <Box m="20px">
      <Header title="EDIT USER" subtitle="Chỉnh sửa thông tin cá nhân" />
      {success && <Box color="success.main" mb={2}>{success}</Box>}
      <Formik
        enableReinitialize
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Box display="grid" gap="30px" gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{ "& > div": { gridColumn: isNonMobile ? undefined : "span 4" } }}>
              <Box gridColumn="span 4">
                <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>Ảnh đại diện</label>
                <input type="file" accept="image/*" onChange={e => handleImageChange(e, setFieldValue)} />
                {preview && <img src={preview} alt="avatar" style={{ width: 80, height: 80, borderRadius: "50%", marginTop: 8 }} />}
              </Box>
              <TextField
                fullWidth variant="filled" type="text" label="Name"
                onBlur={handleBlur} onChange={handleChange}
                value={values.name} name="name"
                error={!!touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth variant="filled" type="email" label="Email"
                onBlur={handleBlur} onChange={handleChange}
                value={values.email} name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth variant="filled" type="password" label="Password"
                onBlur={handleBlur} onChange={handleChange}
                value={values.password} name="password"
                error={!!touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                sx={{ gridColumn: "span 4" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Lưu thông tin
              </Button>
            </Box>
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
  );
};

const checkoutSchema = yup.object().shape({
  name: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  password: yup.string(),
  image: yup.mixed(),
});

export default Form;
