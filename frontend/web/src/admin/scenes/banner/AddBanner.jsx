import React from 'react';
import { Box, Button, TextField, Typography, Switch, FormControlLabel } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';

const AddBanner = () => {
  return (
    <Box
      sx={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          textAlign: 'center',
          marginBottom: '20px',
          color: '#e2e8f0',
        }}
      >
        Thêm Banner Mới
      </Typography>

      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadIcon />}
          sx={{
            padding: '12px',
            borderColor: '#38bdf8',
            color: '#38bdf8',
            '&:hover': {
              backgroundColor: '#38bdf8',
              color: '#fff',
            },
          }}
        >
          Chọn File
          <input type="file" hidden />
        </Button>

        <TextField
          label="Tiêu đề banner"
          variant="outlined"
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: '#f1f5f9',
            },
          }}
        />

        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Đang hoạt động"
          sx={{
            color: '#e2e8f0',
          }}
        />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '15px',
          }}
        >
          <Button
            variant="contained"
            color="success"
            sx={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
            }}
          >
            Lưu
          </Button>

          <Button
            variant="outlined"
            color="error"
            sx={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
            }}
          >
            Hủy
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddBanner;