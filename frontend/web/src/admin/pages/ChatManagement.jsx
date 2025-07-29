import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/ProductLayout.module.css';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import io from 'socket.io-client';
import ChatDetailDialog from '../components/ChatDetailDialog';

const socket = io.connect("http://localhost:5000");

const ChatManagement = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Fetch all chats from API
  const fetchChats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chats');
      const data = await response.json();

      // Filter chats based on search and status
      let filteredChats = data;

      if (searchTerm) {
        filteredChats = filteredChats.filter(chat =>
          chat.clientUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chat.adminUsername?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (filterStatus) {
        filteredChats = filteredChats.filter(chat => chat.status === filterStatus);
      }

      setChats(filteredChats);
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
  }, [searchTerm, filterStatus]);

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

  // Định dạng thời gian
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
  };

  // Lấy màu trạng thái
  const getStatusClass = (status) => {
    switch (status) {
      case 'mới':
        return styles.statusInactive; // Đỏ
      case 'đang diễn ra':
        return styles.statusActive; // Xanh
      case 'đã kết thúc':
        return styles.status; // Mặc định
      default:
        return styles.status;
    }
  };

  if (loading) return <div className={styles.container}>Đang tải...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Quản lý tin nhắn</h1>
      <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
        Quản lý tất cả các cuộc trò chuyện với khách hàng
      </p>

      {/* Thống kê nhanh */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div className={styles.card} style={{ textAlign: 'center', padding: '20px' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '600', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            {chats.filter(chat => chat.status === 'mới').length}
          </h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0' }}>Tin nhắn mới</p>
        </div>

        <div className={styles.card} style={{ textAlign: 'center', padding: '20px' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '600', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            {chats.filter(chat => chat.status === 'đang diễn ra').length}
          </h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0' }}>Đang diễn ra</p>
        </div>

        <div className={styles.card} style={{ textAlign: 'center', padding: '20px' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '600', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            {chats.filter(chat => chat.status === 'đã kết thúc').length}
          </h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0' }}>Đã kết thúc</p>
        </div>

        <div className={styles.card} style={{ textAlign: 'center', padding: '20px' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '600', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            {chats.length}
          </h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0' }}>Tổng cộng</p>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className={styles.card}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên khách hàng hoặc admin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.input}
            style={{ flex: '1', minWidth: '300px' }}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.select}
            style={{ minWidth: '150px' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="mới">Tin nhắn mới</option>
            <option value="đang diễn ra">Đang diễn ra</option>
            <option value="đã kết thúc">Đã kết thúc</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách chat */}
      <div className={styles.card}>
        <table className={styles.productTable}>
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Trạng thái</th>
              <th>Admin phụ trách</th>
              <th>Số tin nhắn</th>
              <th>Thời gian tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {chats.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Không có cuộc trò chuyện nào
                </td>
              </tr>
            ) : (
              chats.map((chat) => (
                <tr key={chat._id}>
                  <td style={{ fontWeight: '500' }}>{chat.clientUsername || 'Không rõ'}</td>
                  <td>
                    <span className={`${styles.status} ${getStatusClass(chat.status)}`}>
                      {chat.status}
                    </span>
                  </td>
                  <td>{chat.adminUsername || 'Chưa có'}</td>
                  <td style={{ textAlign: 'center' }}>{chat.messages ? chat.messages.length : 0}</td>
                  <td style={{ fontSize: '0.9rem' }}>{formatDate(chat.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => handleChatClick(chat)}
                        className={`${styles.actionBtn} ${styles.iconBtn}`}
                        title="Xem chi tiết"
                      >
                        <VisibilityOutlinedIcon />
                      </button>
                      {chat.status !== 'đã kết thúc' && (
                        <button
                          onClick={() => updateChatStatus(chat.roomId, 'đã kết thúc')}
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          title="Kết thúc chat"
                        >
                          <StopCircleOutlinedIcon />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
    </div>
  );
};

export default ChatManagement;
