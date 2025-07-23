
import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { tokens } from '../theme';

const socket = io.connect("http://localhost:5000");

function AdminChatManager({ adminUsername }) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Lấy tên admin thực tế từ localStorage
    const getAdminUsername = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return user?.username || user?.name || adminUsername || 'Admin';
        } catch {
            return adminUsername || 'Admin';
        }
    };

    const realAdminUsername = getAdminUsername();

    useEffect(() => {
        console.log('AdminChatManager mounted, listening for new chat sessions...');
        
        // Kiểm tra kết nối socket
        if (!socket.connected) {
            console.log('Socket not connected, attempting to connect...');
            socket.connect();
        }
        
        // Cleanup previous listeners
        socket.off('new_chat_session');
        
        // Lắng nghe các cuộc trò chuyện mới
        const handleNewChatSession = (data) => {
            console.log('New chat session received in AdminChatManager:', data);
            // Thêm thông báo mới, tránh trùng lặp
            setNotifications(prev => {
                const exists = prev.some(n => n.roomId === data.roomId);
                if (!exists) {
                    console.log('Adding new notification:', data);
                    return [...prev, data];
                }
                console.log('Notification already exists for room:', data.roomId);
                return prev;
            });
        };

        socket.on('new_chat_session', handleNewChatSession);

        // Debug: Log socket connection status
        socket.on('connect', () => {
            console.log('AdminChatManager: Socket connected');
        });

        socket.on('disconnect', () => {
            console.log('AdminChatManager: Socket disconnected');
        });

        return () => {
            socket.off('new_chat_session', handleNewChatSession);
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleGoToChatManagement = () => {
        navigate('/admin/chat-management');
        handleClose();
    };

    const handleJoinChat = (roomId, username) => {
        // Xóa thông báo
        setNotifications(prev => prev.filter(n => n.roomId !== roomId));
        // Chuyển đến trang quản lý và mở chat cụ thể
        navigate(`/admin/chat-management?room=${roomId}`);
        handleClose();
    };

    return (
        <Box>
            <IconButton
                onClick={handleClick}
                size="large"
                sx={{ color: colors.grey[100] }}
            >
                <Badge badgeContent={notifications.length} color="error">
                    <NotificationsOutlinedIcon />
                </Badge>
            </IconButton>
            
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        backgroundColor: colors.primary[400],
                        minWidth: 300,
                        maxHeight: 400
                    }
                }}
            >
                <Box p="10px" borderBottom={`1px solid ${colors.grey[700]}`}>
                    <Typography variant="h6" color={colors.grey[100]}>
                        Thông báo tin nhắn
                    </Typography>
                </Box>

                {notifications.length === 0 ? (
                    <MenuItem disabled>
                        <Typography color={colors.grey[300]}>
                            Không có tin nhắn mới
                        </Typography>
                    </MenuItem>
                ) : (
                    notifications.map(notif => (
                        <MenuItem 
                            key={notif.roomId} 
                            onClick={() => handleJoinChat(notif.roomId, notif.username)}
                            sx={{ 
                                borderBottom: `1px solid ${colors.grey[700]}`,
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                py: 2
                            }}
                        >
                            <Typography color={colors.grey[100]} fontWeight="bold">
                                {notif.username}
                            </Typography>
                            <Typography color={colors.grey[300]} variant="body2">
                                Tin nhắn mới • {new Date(notif.timestamp).toLocaleTimeString('vi-VN')}
                            </Typography>
                        </MenuItem>
                    ))
                )}

                <Box p="10px" borderTop={`1px solid ${colors.grey[700]}`}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ChatOutlinedIcon />}
                        onClick={handleGoToChatManagement}
                        sx={{
                            backgroundColor: colors.blueAccent[700],
                            '&:hover': {
                                backgroundColor: colors.blueAccent[800]
                            }
                        }}
                    >
                        Xem tất cả tin nhắn
                    </Button>
                </Box>
            </Menu>
        </Box>
    );
}

export default AdminChatManager;