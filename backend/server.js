const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");
const Chat = require('./models/Chat');
require('dotenv').config();
const cron = require('node-cron');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);

// Khởi tạo Socket.IO server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"]
  }
});

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:3001'],
  credentials: true
}));

// Security headers - CSP for VNPay
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vnpayment.vn sandbox.vnpayment.vn; " +
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.jsdelivr.net; " +
    "font-src 'self' fonts.gstatic.com cdn.jsdelivr.net; " +
    "img-src 'self' data: blob: *; " +
    "connect-src 'self' *.vnpayment.vn sandbox.vnpayment.vn; " +
    "frame-src 'self' *.vnpayment.vn sandbox.vnpayment.vn; " +
    "form-action 'self' *.vnpayment.vn sandbox.vnpayment.vn;"
  );
  next();
});

// Parse JSON body
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB connection error:', err));

// Middleware để thêm socket instance vào request
const addSocketMiddleware = (req, res, next) => {
  req.io = io;
  next();
};

// Routes với Socket.IO middleware
app.use('/api/categories', addSocketMiddleware, require('./routes/category.routes'));
app.use('/api/products', addSocketMiddleware, require('./routes/product.routes'));
app.use('/api/users', addSocketMiddleware, require('./routes/user.routes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cart', addSocketMiddleware, require('./routes/cart.routes'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/comments', require('./routes/Comment/CommentRoutes'));
app.use('/api/bill', addSocketMiddleware, require('./routes/Bill/billroutes'));
app.use('/api/vouchers', addSocketMiddleware, require('./routes/voucher.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/stock', require('./routes/stockCheck.routes'));
app.use('/api/deleted-variants', require('./routes/deletedVariant.routes'));
app.use('/api/banners', addSocketMiddleware, require('./routes/bannerRoutes'));
app.use('/api/chats', require('./routes/chat.routes.js'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/test-email', require('./routes/test-email.routes'));

// XÓA dòng này vì đã xóa test.routes:
// app.use('/api/test', require('./routes/test.routes')); // ❌ REMOVED

// XÓA import vnpayReturn.controller vì đã không dùng:
// const vnpayReturnController = require('./controllers/vnpayReturn.controller'); // ❌ REMOVED

// XÓA VNPay return URL handler trực tiếp vì đã có trong payment.routes:
// app.get('/vnpay_return', ...) // ❌ REMOVED

// Add a basic route for the root URL
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Serve payment result page
app.get('/payment-result.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/web/public/payment-result.html'));
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('admin_join', () => {
    socket.join('admin_room');
    console.log(`Admin ${socket.id} joined admin_room`);
  });

  socket.on('join_room', async (data) => {
    socket.join(data.room);
    console.log(`User '${data.username}' (ID: ${socket.id}) joined room: ${data.room}`);

    try {
      const existingChat = await Chat.findOne({ roomId: data.room });

      if (!existingChat) {
        if (!data.isAdmin) {
          const newChat = new Chat({
            roomId: data.room,
            clientUsername: data.username,
            status: 'mới'
          });
          await newChat.save();

          console.log('Emitting new_chat_session to admin room:', {
            roomId: data.room,
            username: data.username,
            timestamp: new Date()
          });
          io.to('admin_room').emit('new_chat_session', {
            roomId: data.room,
            username: data.username,
            timestamp: new Date()
          });
          io.to('admin_room').emit('update_chat_list');
        }
      } else {
        if (data.isAdmin && existingChat.status === 'mới') {
          const updatedChat = await Chat.findOneAndUpdate(
            { roomId: data.room },
            {
              status: 'đang diễn ra',
              adminUsername: data.username
            },
            { new: true }
          );

          if (updatedChat) {
            io.to(data.room).emit('admin_joined', {
              message: `${data.username} đã tham gia cuộc trò chuyện`,
              adminName: data.username
            });

            io.to(data.room).emit('update_status', { status: 'đang diễn ra' });
            io.to('admin_room').emit('update_chat_list');
          }
        } else if (data.isAdmin) {
          if (existingChat.adminUsername !== data.username) {
            await Chat.updateOne({ roomId: data.room }, { adminUsername: data.username });
          }
        }

        io.to(data.room).emit('chat_history', existingChat.messages);
      }
    } catch (error) {
      console.error('Error handling join_room:', error);
    }
  });

  socket.on('send_message', async (data) => {
    try {
      console.log('Received message:', data);

      const updatedChat = await Chat.findOneAndUpdate(
        { roomId: data.room },
        {
          $push: {
            messages: {
              author: data.author,
              message: data.message,
              timestamp: new Date()
            }
          }
        },
        { new: true }
      );

      if (updatedChat) {
        console.log('Message saved to DB, broadcasting to room:', data.room);
        io.to(data.room).emit('receive_message', data);
      } else {
        console.error('Chat room not found:', data.room);
      }
    } catch (error) {
      console.error('Error handling send_message:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log('User Disconnected', socket.id);

    try {
      const activeChat = await Chat.findOne({ adminUsername: socket.id, status: 'đang diễn ra' });

      if (activeChat) {
        activeChat.status = 'đã kết thúc';
        activeChat.ngay_cap_nhat = new Date();
        await activeChat.save();

        io.to(activeChat.roomId).emit('chat_ended', {
          message: `Admin đã thoát khỏi cuộc trò chuyện.`,
          endedBy: 'admin',
          timestamp: new Date()
        });

        console.log(`Chat ${activeChat.roomId} đã kết thúc do admin thoát.`);
      }
    } catch (error) {
      console.error('Error handling admin disconnect:', error);
    }
  });

  socket.on('end_chat', async (data) => {
    try {
      const updatedChat = await Chat.findOneAndUpdate(
        { roomId: data.roomId },
        { status: 'đã kết thúc' },
        { new: true }
      );

      if (updatedChat) {
        io.to(data.roomId).emit('chat_ended', {
          message: `Cuộc trò chuyện đã được ${data.endedBy} kết thúc.`,
          endedBy: data.endedBy,
          username: data.username,
          timestamp: new Date()
        });
        io.to('admin_room').emit('update_chat_list');

        console.log(`Chat ${data.roomId} ended by ${data.endedBy}: ${data.username}`);
      }
    } catch (error) {
      console.error('Error ending chat:', error);
    }
  });
});

// Start server
server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});

// Auto cancel VNPAY orders after 5 minutes
const Bill = require('./models/Bill/BillUser');
const Product = require('./models/Product');

setInterval(async () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  try {
    const bills = await Bill.find({
      phuong_thuc_thanh_toan: 'VNPAY',
      thanh_toan: 'chưa thanh toán',
      trang_thai: { $ne: 'đã hủy' },
      ngay_tao: { $lte: fiveMinutesAgo },
      orderId: { $exists: true, $ne: null }
    });

    for (const bill of bills) {
      for (const item of bill.danh_sach_san_pham) {
        const updateResult = await Product.updateOne(
          {
            _id: item.san_pham_id,
            "variants": {
              $elemMatch: {
                "attributes.color": item.mau_sac,
                "attributes.size": item.kich_thuoc
              }
            }
          },
          {
            $inc: { "variants.$.stock": item.so_luong }
          }
        );

        if (updateResult.modifiedCount === 0) {
          const fallbackUpdateResult = await Product.updateOne(
            {
              _id: item.san_pham_id,
              $or: [{ variants: { $exists: false } }, { variants: { $size: 0 } }]
            },
            {
              $inc: { stock: item.so_luong }
            }
          );
        }
      }

      bill.trang_thai = 'đã hủy';
      bill.ly_do_huy = 'Khách không hoàn tất thanh toán VNPAY trong 5 phút';
      bill.nguoi_huy = {
        id: null,
        loai: 'Admin'
      };
      await bill.save();
    }
  } catch (err) {
    console.error('[AUTO CANCEL] Lỗi khi kiểm tra/hủy đơn hàng VNPAY:', err);
  }
}, 60 * 1000);

// Auto update orders to 'đã nhận hàng' after 3 days
setInterval(async () => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  try {
    const bills = await Bill.find({
      trang_thai: 'đã giao hàng',
      ngay_cap_nhat: { $lte: threeDaysAgo }
    });
    for (const bill of bills) {
      bill.trang_thai = 'đã nhận hàng';
      bill.ngay_cap_nhat = new Date();
      await bill.save();
    }
  } catch (err) {
    console.error('[AUTO UPDATE] Lỗi khi tự động cập nhật trạng thái đơn hàng:', err);
  }
}, 60 * 60 * 1000);