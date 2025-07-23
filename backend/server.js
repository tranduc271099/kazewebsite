const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http'); // Thêm http
const { Server } = require("socket.io"); // Thêm Server từ socket.io
const Chat = require('./models/Chat'); // Thêm import model Chat
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Tạo máy chủ HTTP

// Khởi tạo Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Địa chỉ của frontend
    methods: ["GET", "POST"]
  }
});

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:3001'],
  credentials: true
}));

// Routes that need multipart/form-data should come before express.json()
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/products', require('./routes/product.routes'));

// Thêm middleware để parse JSON body
app.use(express.json());

// Cấu hình static cho thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB connection error:', err));

// Routes
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/comments', require('./routes/Comment/CommentRoutes'));

app.use('/api/bill', require('./routes/Bill/billroutes'))

app.use('/api/vouchers', require('./routes/voucher.routes'));

// Thêm route payment
app.use('/api/payment', require('./routes/payment.routes'));

app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/chats', require('./routes/chat.routes.js'));

const vnpayReturnController = require('./controllers/vnpayReturn.controller');
app.get('/vnpay_return', async (req, res) => {
  try {
    const result = await vnpayReturnController.handleVnpayReturn(req.query);
    if (result.status === 200) {
      res.redirect('http://localhost:3000/payment-success?orderId=' + encodeURIComponent(result.data.orderId || '') + '&transactionNo=' + encodeURIComponent(result.data.transactionNo || ''));
    } else {
      res.redirect('http://localhost:3000/payment-failure?orderId=' + encodeURIComponent(result.data.orderId || '') + '&responseCode=' + encodeURIComponent(result.data.responseCode || '') + '&message=' + encodeURIComponent(result.data.message || ''));
    }
  } catch (error) {
    res.redirect('http://localhost:3000/payment-failure?message=Internal%20server%20error');
  }
});

// Add a basic route for the root URL
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Logic xử lý chat thời gian thực đã nâng cấp
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Khi client hoặc admin tham gia phòng
  socket.on('join_room', async (data) => { // data = { room, username, isAdmin }
    socket.join(data.room);
    console.log(`User '${data.username}' (ID: ${socket.id}) joined room: ${data.room}`);

    try {
      // Nếu là client (người dùng mới)
      if (!data.isAdmin) {
        // Kiểm tra xem phòng chat đã tồn tại chưa
        const existingChat = await Chat.findOne({ roomId: data.room });
        
        if (!existingChat) {
          // Tạo phiên chat mới trong DB
          const newChat = new Chat({
            roomId: data.room,
            clientUsername: data.username,
            status: 'mới'
          });
          await newChat.save();
          
          // Thông báo cho tất cả admin về phiên chat mới
          console.log('Emitting new_chat_session to all clients:', {
            roomId: data.room,
            username: data.username,
            timestamp: new Date()
          });
          io.emit('new_chat_session', {
            roomId: data.room,
            username: data.username,
            timestamp: new Date()
          });
        }
      } else { // Nếu là admin tham gia
        // Cập nhật trạng thái và thêm tên admin thực tế
        const updatedChat = await Chat.findOneAndUpdate(
          { roomId: data.room },
          { 
            status: 'đang diễn ra', 
            adminUsername: data.username // Lấy tên admin thực tế từ data.username
          },
          { new: true }
        );
        
        if (updatedChat) {
          // Thông báo cho client rằng admin đã tham gia
          io.to(data.room).emit('admin_joined', {
            message: `${data.username} đã tham gia cuộc trò chuyện`,
            adminName: data.username
          });
        }
      }
    } catch (error) {
      console.error('Error handling join_room:', error);
    }
  });

  // Khi có tin nhắn mới
  socket.on('send_message', async (data) => { // data = { room, author, message, time }
    try {
      console.log('Received message:', data); // Debug log
      
      // Lưu tin nhắn vào DB
      const updatedChat = await Chat.findOneAndUpdate(
        { roomId: data.room },
        {
          $push: {
            messages: {
              author: data.author,
              message: data.message,
              timestamp: new Date() // Dùng timestamp của server cho chính xác
            }
          }
        },
        { new: true }
      );
      
      if (updatedChat) {
        console.log('Message saved to DB, broadcasting to room:', data.room);
        // Gửi tin nhắn đến mọi người trong phòng
        io.to(data.room).emit('receive_message', data);
      } else {
        console.error('Chat room not found:', data.room);
      }
    } catch (error) {
      console.error('Error handling send_message:', error);
    }
  });

  // Khi admin hoặc client kết thúc cuộc trò chuyện
  socket.on('end_chat', async (data) => { // data = { roomId, endedBy, username }
    try {
      const updatedChat = await Chat.findOneAndUpdate(
        { roomId: data.roomId }, 
        { status: 'đã kết thúc' },
        { new: true }
      );
      
      if (updatedChat) {
        // Thông báo cho tất cả người trong phòng rằng chat đã kết thúc
        io.to(data.roomId).emit('chat_ended', {
          message: `Cuộc trò chuyện đã được ${data.endedBy} kết thúc.`,
          endedBy: data.endedBy,
          username: data.username,
          timestamp: new Date()
        });
        
        console.log(`Chat ${data.roomId} ended by ${data.endedBy}: ${data.username}`);
      }
    } catch (error) {
      console.error('Error ending chat:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});


server.listen(process.env.PORT, () => { // Thay app.listen bằng server.listen
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});

const createPaymentUrl = (orderId, amount, orderInfo) => {
  const date = new Date();
  const pad = (n) => n < 10 ? '0' + n : n;
  const createDate =
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds());

  vnp_Params['vnp_CreateDate'] = createDate;
};