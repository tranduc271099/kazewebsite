import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Grid,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { PhotoCamera, Save, Cancel } from '@mui/icons-material';
import { tokens } from '../../theme';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const EditProfile = () => {
  const theme = useTheme();
  const colors = tokens();

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
  });

  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data;
      setProfileData(data);
      setOriginalData(data);
      setAvatarPreview(data.avatar || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Không thể tải thông tin profile');
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh hợp lệ');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 5MB');
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Tên không được để trống';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (profileData.phone && !/^[0-9]{10,11}$/.test(profileData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    return (
      profileData.name !== originalData.name ||
      profileData.email !== originalData.email ||
      profileData.phone !== originalData.phone ||
      profileData.address !== originalData.address ||
      avatarFile !== null
    );
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    if (!hasChanges()) {
      toast.info('Không có thay đổi nào để lưu');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('name', profileData.name);
      formData.append('email', profileData.email);
      formData.append('phone', profileData.phone);
      formData.append('address', profileData.address);

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await axios.put('http://localhost:5000/api/auth/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update localStorage if needed
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.name = profileData.name;
      user.avatar = response.data.avatar || user.avatar;
      localStorage.setItem('user', JSON.stringify(user));

      setOriginalData(profileData);
      setAvatarFile(null);
      toast.success('Cập nhật thông tin thành công!');

      // Trigger a custom event to update sidebar
      window.dispatchEvent(new CustomEvent('profileUpdated', {
        detail: { name: profileData.name, avatar: response.data.avatar }
      }));

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      setShowConfirmDialog(true);
    }
  };

  const confirmCancel = () => {
    setProfileData(originalData);
    setAvatarFile(null);
    setAvatarPreview(originalData.avatar || '');
    setErrors({});
    setShowConfirmDialog(false);
    toast.info('Đã hủy các thay đổi');
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: colors.grey[100] }}>
        Chỉnh sửa thông tin cá nhân
      </Typography>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          background: colors.primary[400],
          maxWidth: 800,
          mx: 'auto'
        }}
      >
        <Grid container spacing={3}>
          {/* Avatar Section */}
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={avatarPreview}
                sx={{
                  width: 150,
                  height: 150,
                  mb: 2,
                  border: `3px solid ${colors.primary[300]}`
                }}
              />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload">
                <IconButton
                  color="primary"
                  aria-label="upload avatar"
                  component="span"
                  sx={{
                    background: colors.primary[300],
                    '&:hover': { background: colors.primary[200] }
                  }}
                >
                  <PhotoCamera />
                </IconButton>
              </label>
              <Typography variant="caption" sx={{ color: colors.grey[300], mt: 1, textAlign: 'center' }}>
                Chọn ảnh đại diện<br />
                (Tối đa 5MB)
              </Typography>
            </Box>
          </Grid>

          {/* Form Fields */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  sx={{
                    '& .MuiInputLabel-root': { color: colors.grey[300] },
                    '& .MuiOutlinedInput-root': {
                      color: colors.grey[100],
                      '& fieldset': { borderColor: colors.grey[600] },
                      '&:hover fieldset': { borderColor: colors.grey[400] },
                      '&.Mui-focused fieldset': { borderColor: colors.primary[200] }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{
                    '& .MuiInputLabel-root': { color: colors.grey[300] },
                    '& .MuiOutlinedInput-root': {
                      color: colors.grey[100],
                      '& fieldset': { borderColor: colors.grey[600] },
                      '&:hover fieldset': { borderColor: colors.grey[400] },
                      '&.Mui-focused fieldset': { borderColor: colors.primary[200] }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  sx={{
                    '& .MuiInputLabel-root': { color: colors.grey[300] },
                    '& .MuiOutlinedInput-root': {
                      color: colors.grey[100],
                      '& fieldset': { borderColor: colors.grey[600] },
                      '&:hover fieldset': { borderColor: colors.grey[400] },
                      '&.Mui-focused fieldset': { borderColor: colors.primary[200] }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  multiline
                  rows={3}
                  value={profileData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  sx={{
                    '& .MuiInputLabel-root': { color: colors.grey[300] },
                    '& .MuiOutlinedInput-root': {
                      color: colors.grey[100],
                      '& fieldset': { borderColor: colors.grey[600] },
                      '&:hover fieldset': { borderColor: colors.grey[400] },
                      '&.Mui-focused fieldset': { borderColor: colors.primary[200] }
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={loading}
                sx={{
                  color: colors.grey[300],
                  borderColor: colors.grey[600],
                  '&:hover': {
                    borderColor: colors.grey[400],
                    background: 'rgba(255,255,255,0.05)'
                  }
                }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={loading || !hasChanges()}
                sx={{
                  background: colors.primary[200],
                  '&:hover': { background: colors.primary[100] }
                }}
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {hasChanges() && (
          <Alert severity="info" sx={{ mt: 2, background: colors.primary[300] }}>
            Bạn có thay đổi chưa được lưu
          </Alert>
        )}
      </Paper>

      {/* Confirm Cancel Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Xác nhận hủy</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn hủy?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Không</Button>
          <Button onClick={confirmCancel} color="error" autoFocus>
            Có, hủy thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditProfile;
