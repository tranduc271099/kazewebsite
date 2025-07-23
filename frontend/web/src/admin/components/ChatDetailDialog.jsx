import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { tokens } from '../theme';

const ChatDetailDialog = ({ open, onClose, chatData, onUpdateStatus, socket }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Lấy tên admin thực tế từ localStorage
  const getAdminUsername = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.username || user?.name || 'Admin';
    } catch {
      return 'Admin';
    }
  };
  
  const [adminUsername] = useState(getAdminUsername());
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chatData) {
      setMessages(chatData.messages || []);
      
      // Cleanup previous listeners
      socket.off('receive_message');
      socket.off('chat_ended');
      socket.off('admin_joined');
      
      // Join room khi mở dialog
      socket.emit('join_room', {
        room: chatData.roomId,
        username: adminUsername,
        isAdmin: true
      });

      // Lắng nghe tin nhắn mới
      const handleReceiveMessage = (data) => {
        if (data.room === chatData.roomId) {
          setMessages(prev => [...prev, {
            author: data.author,
            message: data.message,
            timestamp: data.time
          }]);
        }
      };

      // Lắng nghe khi chat kết thúc
      const handleChatEnded = (data) => {
        if (typeof data === 'string') {
          // Backward compatibility
          alert(data);
        } else {
          // New format với thông tin chi tiết
          alert(`${data.message}\nThời gian: ${new Date(data.timestamp).toLocaleString('vi-VN')}`);
        }
        // Tự động đóng dialog khi chat kết thúc
        setTimeout(() => {
          onClose();
        }, 2000);
      };

      // Lắng nghe khi admin tham gia
      const handleAdminJoined = (data) => {
        // Hiển thị thông báo admin đã tham gia
        setMessages(prev => [...prev, {
          author: 'System',
          message: data.message,
          timestamp: new Date(),
          isSystemMessage: true
        }]);
      };

      socket.on('receive_message', handleReceiveMessage);
      socket.on('chat_ended', handleChatEnded);
      socket.on('admin_joined', handleAdminJoined);
    }

    return () => {
      socket.off('receive_message');
      socket.off('chat_ended');
      socket.off('admin_joined');
    };
  }, [chatData, socket, adminUsername, onClose]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gửi tin nhắn
  const sendMessage = () => {
    if (newMessage.trim() && chatData) {
      const messageData = {
        room: chatData.roomId,
        author: adminUsername,
        message: newMessage,
        time: new Date().toLocaleTimeString('vi-VN')
      };

      socket.emit('send_message', messageData);
      setNewMessage('');
    }
  };

  // Xử lý nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Bắt đầu chat (chuyển từ 'mới' sang 'đang diễn ra')
  const startChat = () => {
    if (chatData && chatData.status === 'mới') {
      onUpdateStatus(chatData.roomId, 'đang diễn ra');
    }
  };

  // Kết thúc chat
  const endChat = () => {
    if (chatData && window.confirm('Bạn có chắc muốn kết thúc cuộc trò chuyện này?')) {
      // Gửi sự kiện kết thúc chat với thông tin chi tiết
      socket.emit('end_chat', {
        roomId: chatData.roomId,
        endedBy: 'admin',
        username: adminUsername
      });
      
      // Cập nhật trạng thái trong database
      onUpdateStatus(chatData.roomId, 'đã kết thúc');
      onClose();
    }
  };

  if (!chatData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: colors.primary[400],
          height: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: colors.blueAccent[700], 
        color: colors.grey[100],
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box display="flex" alignItems="center" gap="15px">
          <Typography variant="h6">
            Chat với {chatData.clientUsername}
          </Typography>
          <Chip 
            label={chatData.status}
            color={
              chatData.status === 'mới' ? 'error' :
              chatData.status === 'đang diễn ra' ? 'warning' : 'success'
            }
            size="small"
          />
        </Box>
        <Box display="flex" gap="10px" alignItems="center">
          {chatData.status === 'mới' && (
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={startChat}
            >
              Bắt đầu chat
            </Button>
          )}
          {chatData.status === 'đang diễn ra' && (
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={endChat}
            >
              Kết thúc chat
            </Button>
          )}
          <IconButton onClick={onClose} sx={{ color: colors.grey[100] }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        padding: 0
      }}>
        {/* Thông tin chat */}
        <Box p="15px" backgroundColor={colors.primary[500]}>
          <Typography variant="body2" color={colors.grey[300]}>
            <strong>Room ID:</strong> {chatData.roomId}
          </Typography>
          <Typography variant="body2" color={colors.grey[300]}>
            <strong>Thời gian tạo:</strong> {new Date(chatData.createdAt).toLocaleString('vi-VN')}
          </Typography>
          {chatData.adminUsername && (
            <Typography variant="body2" color={colors.grey[300]}>
              <strong>Admin phụ trách:</strong> {chatData.adminUsername}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Khung chat */}
        <Box 
          flex={1} 
          p="15px" 
          sx={{ 
            overflowY: 'auto',
            maxHeight: 'calc(80vh - 200px)'
          }}
        >
          {messages.length === 0 ? (
            <Typography 
              textAlign="center" 
              color={colors.grey[300]}
              mt="50px"
            >
              Chưa có tin nhắn nào trong cuộc trò chuyện này
            </Typography>
          ) : (
            messages.map((msg, index) => {
              // Kiểm tra nếu là system message
              if (msg.isSystemMessage || msg.author === 'System') {
                return (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent="center"
                    mb="10px"
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: '6px 12px',
                        backgroundColor: colors.grey[700],
                        color: colors.grey[100],
                        borderRadius: '15px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <Typography variant="caption" style={{ fontStyle: 'italic' }}>
                        {msg.message}
                      </Typography>
                    </Paper>
                  </Box>
                );
              }

              // Tin nhắn thường
              return (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={msg.author === adminUsername ? 'flex-end' : 'flex-start'}
                  mb="10px"
                >
                  <Box
                    display="flex"
                    alignItems="flex-start"
                    gap="8px"
                    maxWidth="70%"
                    flexDirection={msg.author === adminUsername ? 'row-reverse' : 'row'}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: msg.author === adminUsername ? colors.blueAccent[600] : colors.greenAccent[600]
                      }}
                    >
                      {msg.author === adminUsername ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                    </Avatar>
                    
                    <Paper
                      elevation={1}
                      sx={{
                        p: '8px 12px',
                        backgroundColor: msg.author === adminUsername ? colors.blueAccent[700] : colors.greenAccent[700],
                        color: colors.grey[100],
                        borderRadius: '18px'
                      }}
                    >
                      <Typography variant="body2">{msg.message}</Typography>
                      <Typography
                        variant="caption"
                        color={colors.grey[300]}
                        display="block"
                        textAlign={msg.author === adminUsername ? 'right' : 'left'}
                        mt="4px"
                      >
                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN')}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input gửi tin nhắn */}
        {chatData.status !== 'đã kết thúc' && (
          <>
            <Divider />
            <Box p="15px" display="flex" gap="10px">
              <TextField
                fullWidth
                multiline
                maxRows={3}
                placeholder="Nhập tin nhắn..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: colors.primary[500],
                    color: colors.grey[100]
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                sx={{ minWidth: '60px' }}
              >
                <SendIcon />
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChatDetailDialog;
