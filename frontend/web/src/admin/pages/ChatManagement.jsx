import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, Card, CardContent, Chip, Button, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { tokens } from '../theme';
import Header from '../components/Header';
import CloseIcon from '@mui/icons-material/Close';
import io from 'socket.io-client';
import ChatDetailDialog from '../components/ChatDetailDialog';

const socket = io.connect("http://localhost:5000");

const ChatManagement = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch all chats from API
  const fetchChats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chats');
      const data = await response.json();
      setChats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();

    // Kiểm tra kết nối socket
    if (!socket.connected) {
      console.log('ChatManagement: Socket not connected, attempting to connect...');
      socket.connect();
    }

    // Lắng nghe các phiên chat mới
    const handleNewChatSession = (data) => {
      console.log('ChatManagement: New chat session received:', data);
      // Refresh danh sách khi có chat mới
      fetchChats();
    };

    socket.on('new_chat_session', handleNewChatSession);

    // Debug: Log socket connection status
    socket.on('connect', () => {
      console.log('ChatManagement: Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('ChatManagement: Socket disconnected');
    });

    return () => {
      socket.off('new_chat_session', handleNewChatSession);
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  // Xử lý khi click vào một cuộc trò chuyện
  const handleChatClick = (chatData) => {
    setSelectedChat(chatData);
    setOpenDialog(true);
  };

  // Cập nhật trạng thái chat
  const updateChatStatus = async (roomId, status) => {
    try {
      await fetch(`http://localhost:5000/api/chats/${roomId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      // Refresh danh sách sau khi cập nhật
      fetchChats();
      
      // Nếu kết thúc chat, gửi sự kiện socket
      if (status === 'đã kết thúc') {
        socket.emit('end_chat', {
          roomId: roomId,
          endedBy: 'admin',
          username: 'Admin'
        });
      }
    } catch (error) {
      console.error('Error updating chat status:', error);
    }
  };

  // Định nghĩa columns cho DataGrid
  const columns = [
    {
      field: 'clientUsername',
      headerName: 'Khách hàng',
      flex: 1,
      cellClassName: 'name-column--cell',
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      flex: 1,
      renderCell: ({ row: { status } }) => {
        return (
          <Box display="flex" justifyContent="flex-start" alignItems="center">
            <Chip 
              label={status}
              color={
                status === 'mới' ? 'error' :
                status === 'đang diễn ra' ? 'warning' : 'success'
              }
              variant="filled"
            />
          </Box>
        );
      },
    },
    {
      field: 'adminUsername',
      headerName: 'Admin phụ trách',
      flex: 1,
      renderCell: ({ row: { adminUsername } }) => {
        return (
          <Typography color={colors.greenAccent[500]}>
            {adminUsername || 'Chưa có'}
          </Typography>
        );
      },
    },
    {
      field: 'messageCount',
      headerName: 'Số tin nhắn',
      flex: 0.5,
      renderCell: ({ row: { messages } }) => {
        return (
          <Typography>{messages ? messages.length : 0}</Typography>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Thời gian tạo',
      flex: 1,
      renderCell: ({ row: { createdAt } }) => {
        return (
          <Typography>
            {new Date(createdAt).toLocaleString('vi-VN')}
          </Typography>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Hành động',
      flex: 1,
      renderCell: ({ row }) => {
        return (
          <Box display="flex" gap="10px">
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleChatClick(row)}
            >
              Xem chi tiết
            </Button>
            {row.status !== 'đã kết thúc' && (
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => updateChatStatus(row.roomId, 'đã kết thúc')}
              >
                Kết thúc
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box m="20px">
      <Header title="QUẢN LÝ TIN NHẮN" subtitle="Quản lý tất cả các cuộc trò chuyện với khách hàng" />
      
      {/* Thống kê nhanh */}
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gridAutoRows="140px" gap="20px" mb="20px">
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center" borderRadius="8px">
          <Box textAlign="center">
            <Typography variant="h4" fontWeight="600" color={colors.grey[100]}>
              {chats.filter(chat => chat.status === 'mới').length}
            </Typography>
            <Typography color={colors.greenAccent[500]}>Tin nhắn mới</Typography>
          </Box>
        </Box>
        
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center" borderRadius="8px">
          <Box textAlign="center">
            <Typography variant="h4" fontWeight="600" color={colors.grey[100]}>
              {chats.filter(chat => chat.status === 'đang diễn ra').length}
            </Typography>
            <Typography color={colors.greenAccent[500]}>Đang diễn ra</Typography>
          </Box>
        </Box>
        
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center" borderRadius="8px">
          <Box textAlign="center">
            <Typography variant="h4" fontWeight="600" color={colors.grey[100]}>
              {chats.filter(chat => chat.status === 'đã kết thúc').length}
            </Typography>
            <Typography color={colors.greenAccent[500]}>Đã kết thúc</Typography>
          </Box>
        </Box>
        
        <Box gridColumn="span 3" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center" borderRadius="8px">
          <Box textAlign="center">
            <Typography variant="h4" fontWeight="600" color={colors.grey[100]}>
              {chats.length}
            </Typography>
            <Typography color={colors.greenAccent[500]}>Tổng cộng</Typography>
          </Box>
        </Box>
      </Box>

      {/* Bảng danh sách chat */}
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid 
          loading={loading}
          rows={chats} 
          columns={columns} 
          getRowId={(row) => row._id}
          pageSize={10}
          rowsPerPageOptions={[10]}
        />
      </Box>

      {/* Dialog chi tiết chat */}
      {selectedChat && (
        <ChatDetailDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          chatData={selectedChat}
          onUpdateStatus={updateChatStatus}
          socket={socket}
        />
      )}
    </Box>
  );
};

export default ChatManagement;
