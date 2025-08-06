import { Box, IconButton, useTheme, Badge, Popover, Typography, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, IconButton as MuiIconButton, MenuList, MenuItem, ClickAwayListener } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import io from 'socket.io-client';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [notifications, setNotifications] = useState(() => {
    // Lấy thông báo từ localStorage khi khởi tạo
    const savedNotifications = localStorage.getItem('adminNotifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      // Lọc thông báo chỉ trong ngày hôm nay
      const today = new Date().toDateString();
      return parsed.filter(notif => {
        const notifDate = new Date(notif.timestamp).toDateString();
        return notifDate === today;
      });
    }
    return [];
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [allNotificationsDialogOpen, setAllNotificationsDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Lưu thông báo vào localStorage mỗi khi có thay đổi
  useEffect(() => {
    localStorage.setItem('adminNotifications', JSON.stringify(notifications));
  }, [notifications]);

  // Kiểm tra và xóa thông báo cũ khi chuyển ngày
  useEffect(() => {
    const checkAndCleanOldNotifications = () => {
      const today = new Date().toDateString();
      setNotifications(prev => {
        const filtered = prev.filter(notif => {
          const notifDate = new Date(notif.timestamp).toDateString();
          return notifDate === today;
        });
        return filtered;
      });
    };

    // Kiểm tra khi component mount
    checkAndCleanOldNotifications();

    // Kiểm tra mỗi giờ
    const interval = setInterval(checkAndCleanOldNotifications, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      // Gửi sự kiện admin tham gia phòng riêng
      newSocket.emit('admin_join');
    });

    newSocket.on('new_chat_session', (data) => {
      setNotifications(prev => [...prev, {
        ...data,
        type: 'chat',
        timestamp: new Date().toISOString()
      }]);
    });

    // Listen for client cart updates
    newSocket.on('client_cart_update', (data) => {
      setNotifications(prev => [...prev, {
        ...data,
        type: 'cart',
        message: `${data.username} đã ${data.action} sản phẩm: ${data.productName}`,
        timestamp: new Date().toISOString()
      }]);
    });

    // Listen for order creation
    newSocket.on('order_created', (data) => {
      setNotifications(prev => [...prev, {
        ...data,
        type: 'order',
        message: `${data.username} đã tạo đơn hàng #${data.orderId} - ${data.productCount} sản phẩm - ${data.totalAmount.toLocaleString('vi-VN')}₫`,
        timestamp: new Date().toISOString()
      }]);
    });

    // Listen for stock reduction
    newSocket.on('stock_reduced', (data) => {
      setNotifications(prev => [...prev, {
        ...data,
        type: 'stock',
        message: `${data.username} đã giảm tồn kho: ${data.productName} (${data.color} - ${data.size}) -${data.quantity}`,
        timestamp: new Date().toISOString()
      }]);
    });

    newSocket.on("getUsers", (data) => {
      // Xử lý danh sách người dùng trực tuyến nếu cần
    });

    return () => {
      newSocket.off('new_chat_session');
      newSocket.off('client_cart_update');
      newSocket.off('order_created');
      newSocket.off('stock_reduced');
      newSocket.disconnect();
    };
  }, []);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleViewAllMessages = () => {
    setAllNotificationsDialogOpen(true);
    setAnchorEl(null);
  };

  const handleCloseAllNotificationsDialog = () => {
    setAllNotificationsDialogOpen(false);
  };

  const handleDeleteNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setAllNotificationsDialogOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleUserIconClick = (event) => {
    setUserAnchorEl(event.currentTarget);
    setUserDropdownOpen(!userDropdownOpen);
  };

  const handleUserDropdownClose = () => {
    setUserDropdownOpen(false);
    setUserAnchorEl(null);
  };

  const handleUserLogout = () => {
    handleUserDropdownClose();
    handleLogout();
  };

  const handleNotificationClickNavigate = (type, data) => {
    let path = '';
    switch (type) {
      case 'chat':
        path = '/admin/chat-management';
        break;
      case 'order':
        path = '/admin/bill';
        break;
      case 'cart':
      case 'stock':
        path = '/admin/products';
        break;
      default:
        path = '/admin/dashboard';
    }
    navigate(path);
    setAllNotificationsDialogOpen(false);
    setAnchorEl(null); // Đóng popup nhỏ
  };

  const openNotification = Boolean(anchorEl);
  const id = openNotification ? 'simple-popover' : undefined;

  return (
    <Box display="flex" justifyContent="flex-end" p={2}>
      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={handleNotificationClick}>
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsOutlinedIcon />
          </Badge>
        </IconButton>
        <Popover
          id={id}
          open={openNotification}
          anchorEl={anchorEl}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Box p={2} sx={{ width: '300px', bgcolor: colors.primary[400], color: colors.grey[100] }}>
            <Typography variant="h6" gutterBottom>Thông báo hệ thống</Typography>
            {notifications.length === 0 ? (
              <Typography>Không có thông báo mới</Typography>
            ) : (
              <List>
                {notifications.slice(-10).reverse().map((notif, index) => (
                  <ListItem key={index} sx={{
                    borderBottom: `1px solid ${colors.grey[700]}`,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    py: 1,
                    cursor: 'pointer'
                  }} onClick={() => handleNotificationClickNavigate(notif.type, notif)}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color={colors.grey[100]}>
                          {notif.type === 'chat' && `Tin nhắn mới từ ${notif.username}`}
                          {notif.type === 'cart' && notif.message}
                          {notif.type === 'order' && notif.message}
                          {notif.type === 'stock' && notif.message}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color={colors.grey[300]}>
                          {format(new Date(notif.timestamp), 'HH:mm dd/MM/yyyy', { locale: vi })}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
            <Button fullWidth variant="contained" sx={{ mt: 1 }} onClick={handleViewAllMessages}>
              Xem tất cả thông báo trong ngày
            </Button>
          </Box>
        </Popover>

        <IconButton onClick={handleUserIconClick}>
          <PersonOutlinedIcon />
        </IconButton>

        {/* User Dropdown Menu */}
        <Popover
          open={userDropdownOpen}
          anchorEl={userAnchorEl}
          onClose={handleUserDropdownClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              bgcolor: colors.primary[400],
              color: colors.grey[100],
              minWidth: 150,
              border: `1px solid ${colors.grey[700]}`,
              borderRadius: 2,
              mt: 1
            }
          }}
        >
          <ClickAwayListener onClickAway={handleUserDropdownClose}>
            <MenuList sx={{ py: 1 }}>
              <MenuItem
                onClick={handleUserLogout}
                sx={{
                  color: colors.grey[100],
                  '&:hover': {
                    bgcolor: colors.primary[500]
                  },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1
                }}
              >
                <LogoutIcon fontSize="small" />
                Đăng xuất
              </MenuItem>
            </MenuList>
          </ClickAwayListener>
        </Popover>
      </Box>

      {/* Dialog hiển thị tất cả thông báo trong ngày */}
      <Dialog
        open={allNotificationsDialogOpen}
        onClose={handleCloseAllNotificationsDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.primary[400],
            color: colors.grey[100],
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: `1px solid ${colors.grey[700]}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">Tất cả thông báo trong ngày</Typography>
          <Box>
            <Button
              variant="outlined"
              size="small"
              onClick={handleClearAllNotifications}
              sx={{ mr: 1, color: colors.grey[100], borderColor: colors.grey[600] }}
            >
              Xóa tất cả
            </Button>
            <IconButton onClick={handleCloseAllNotificationsDialog} sx={{ color: colors.grey[100] }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <Box p={3} textAlign="center">
              <Typography color={colors.grey[300]}>
                Không có thông báo nào trong ngày
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
              {notifications.map((notif, index) => (
                <ListItem
                  key={index}
                  sx={{
                    borderBottom: `1px solid ${colors.grey[700]}`,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    py: 2,
                    px: 3
                  }}
                >
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, cursor: 'pointer' }} onClick={() => handleNotificationClickNavigate(notif.type, notif)}>
                      <Typography variant="body2" color={colors.grey[100]} sx={{ mb: 1 }}>
                        {notif.type === 'chat' && `Tin nhắn mới từ ${notif.username}`}
                        {notif.type === 'cart' && notif.message}
                        {notif.type === 'order' && notif.message}
                        {notif.type === 'stock' && notif.message}
                      </Typography>
                      <Typography variant="caption" color={colors.grey[300]}>
                        {format(new Date(notif.timestamp), 'HH:mm dd/MM/yyyy', { locale: vi })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <MuiIconButton
                        size="small"
                        onClick={() => handleDeleteNotification(index)}
                        sx={{ color: colors.grey[400] }}
                      >
                        <DeleteIcon />
                      </MuiIconButton>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Topbar;
