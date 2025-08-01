const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http'); // Thêm http
const { Server } = require("socket.io"); // Thêm Server từ socket.io
const Chat = require('./models/Chat'); // Thêm import model Chat
require('dotenv').config();
const cron = require('node-cron');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app); // Tạo máy chủ HTTP

// Khởi tạo Socket.IO server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"], // Địa chỉ của frontend
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

// Middleware để thêm socket instance vào request
app.use('/api/cart', (req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/bill', (req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/products', (req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/categories', (req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/vouchers', (req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/users', (req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/banners', (req, res, next) => {
  req.io = io;
  next();
});

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
app.use('/api/test', require('./routes/testRoutes')); // Test route
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

  // Thêm admin vào một phòng riêng
  socket.on('admin_join', () => {
    socket.join('admin_room');
    console.log(`Admin ${socket.id} joined admin_room`);
  });

  // Khi client hoặc admin tham gia phòng
  socket.on('join_room', async (data) => { // data = { room, username, isAdmin }
    socket.join(data.room);
    console.log(`User '${data.username}' (ID: ${socket.id}) joined room: ${data.room}`);

    try {
      const existingChat = await Chat.findOne({ roomId: data.room });

      if (!existingChat) {
        // Nếu là client (người dùng mới) và phòng chưa tồn tại
        if (!data.isAdmin) {
          const newChat = new Chat({
            roomId: data.room,
            clientUsername: data.username,
            status: 'mới'
          });
          await newChat.save();

          // Thông báo cho tất cả admin về phiên chat mới
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
        // Nếu phòng đã tồn tại
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
            // Thông báo cho client rằng admin đã tham gia
            io.to(data.room).emit('admin_joined', {
              message: `${data.username} đã tham gia cuộc trò chuyện`,
              adminName: data.username
            });

            // Gửi trạng thái cập nhật đến frontend
            io.to(data.room).emit('update_status', { status: 'đang diễn ra' });
            io.to('admin_room').emit('update_chat_list');
          }
        } else if (data.isAdmin) {
          // Nếu admin tham gia lại phòng đã kết thúc hoặc đang diễn ra, chỉ cập nhật adminUsername nếu cần
          // và không thay đổi trạng thái.
          if (existingChat.adminUsername !== data.username) {
            await Chat.updateOne({ roomId: data.room }, { adminUsername: data.username });
          }
        }

        // Gửi lịch sử trò chuyện cho admin hoặc client khi tham gia lại
        io.to(data.room).emit('chat_history', existingChat.messages);
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
        // Gửi tin nhắn đến mọi người trong phòng, bao gồm cả người gửi
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
        io.to('admin_room').emit('update_chat_list');

        console.log(`Chat ${data.roomId} ended by ${data.endedBy}: ${data.username}`);
      }
    } catch (error) {
      console.error('Error ending chat:', error);
    }
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

// --- TỰ ĐỘNG HỦY ĐƠN HÀNG VNPAY CHƯA THANH TOÁN SAU 5 PHÚT (CHỈ CHO TRƯỜNG HỢP ĐẶC BIỆT) ---
const Bill = require('./models/Bill/BillUser');
const Product = require('./models/Product');
setInterval(async () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  try {
    // Chỉ hủy đơn hàng VNPAY chưa thanh toán và chưa bị hủy sau 5 phút
    // (Trường hợp đặc biệt khi VNPay không trả về callback)
    const bills = await Bill.find({
      phuong_thuc_thanh_toan: 'VNPAY',
      thanh_toan: 'chưa thanh toán',
      trang_thai: { $ne: 'đã hủy' },
      ngay_tao: { $lte: fiveMinutesAgo },
      orderId: { $exists: true, $ne: null }
    });

    if (bills.length > 0) {
      console.log(`[AUTO CANCEL] Tìm thấy ${bills.length} đơn hàng VNPAY chưa thanh toán sau 5 phút (trường hợp đặc biệt)`);
    }

    for (const bill of bills) {
      // Hoàn kho khi hủy đơn hàng
      for (const item of bill.danh_sach_san_pham) {
        console.log(`[AUTO CANCEL] Restoring stock for product ${item.san_pham_id}, color: ${item.mau_sac}, size: ${item.kich_thuoc}, quantity: ${item.so_luong}`);

        // Thử cập nhật biến thể trước
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

        // Nếu không cập nhật được biến thể, thử cập nhật sản phẩm gốc
        if (updateResult.modifiedCount === 0) {
          console.log(`[AUTO CANCEL] Variant not found, trying to update main product stock`);
          const fallbackUpdateResult = await Product.updateOne(
            {
              _id: item.san_pham_id,
              $or: [{ variants: { $exists: false } }, { variants: { $size: 0 } }]
            },
            {
              $inc: { stock: item.so_luong }
            }
          );

          if (fallbackUpdateResult.modifiedCount === 0) {
            console.log(`[AUTO CANCEL] Failed to restore stock for product ${item.san_pham_id}`);
          } else {
            console.log(`[AUTO CANCEL] Successfully restored main product stock for ${item.san_pham_id}`);
          }
        } else {
          console.log(`[AUTO CANCEL] Successfully restored variant stock for product ${item.san_pham_id}`);
        }
      }

      // Cập nhật trạng thái đơn hàng
      bill.trang_thai = 'đã hủy';
      bill.ly_do_huy = 'Khách không hoàn tất thanh toán VNPAY trong 5 phút (trường hợp đặc biệt)';
      bill.nguoi_huy = {
        id: null,
        loai: 'Admin'
      };
      await bill.save();
      console.log(`[AUTO CANCEL] Đã hủy đơn hàng VNPAY ${bill.orderId} do không thanh toán sau 5 phút (trường hợp đặc biệt).`);
    }
  } catch (err) {
    console.error('[AUTO CANCEL] Lỗi khi kiểm tra/hủy đơn hàng VNPAY:', err);
  }
}, 60 * 1000); // 1 phút chạy 1 lần

// --- TỰ ĐỘNG CHUYỂN ĐƠN HÀNG SANG 'ĐÃ NHẬN HÀNG' SAU 3 NGÀY ---
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
      console.log(`[AUTO UPDATE] Đơn hàng ${bill.orderId} đã tự động chuyển sang 'đã nhận hàng' sau 3 ngày.`);
    }
  } catch (err) {
    console.error('[AUTO UPDATE] Lỗi khi tự động cập nhật trạng thái đơn hàng:', err);
  }
}, 60 * 60 * 1000); // 1 tiếng chạy 1 lần

