import { Box, IconButton, useTheme, Badge, Popover, Typography, List, ListItem, ListItemText, Button } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import io from 'socket.io-client';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      // Gửi sự kiện admin tham gia phòng riêng
      newSocket.emit('admin_join');
    });

    newSocket.on('new_chat_session', (data) => {
      setNotifications(prev => [...prev, { ...data, type: 'chat' }]);
    });

    newSocket.on("getUsers", (data) => {
      // Xử lý danh sách người dùng trực tuyến nếu cần
    });

    return () => {
      newSocket.off('new_chat_session');
      newSocket.disconnect();
    };
  }, []);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const openNotification = Boolean(anchorEl);
  const id = openNotification ? 'simple-popover' : undefined;

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      >
        <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Tìm kiếm" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box>

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
            <Typography variant="h6" gutterBottom>Thông báo tin nhắn</Typography>
            {notifications.length === 0 ? (
              <Typography>Không có tin nhắn mới</Typography>
            ) : (
              <List>
                {notifications.map((notif, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`Tin nhắn mới từ ${notif.username}`}
                      secondary={format(new Date(notif.timestamp), 'HH:mm dd/MM/yyyy', { locale: vi })}
                    />
                  </ListItem>
                ))}
              </List>
            )}
            <Button fullWidth variant="contained" sx={{ mt: 1 }} href="/admin/chat-management">
              Xem tất cả tin nhắn
            </Button>
          </Box>
        </Popover>
        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton>
        <IconButton onClick={handleLogout}>
          <PersonOutlinedIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
