# Kaze Website - E-commerce Platform

## Giới thiệu
Kaze Website là một nền tảng thương mại điện tử được xây dựng với Node.js, Express, MongoDB và React.

## Cấu trúc dự án
```
kazewebsite/
├── backend/                 # Server backend (Node.js, Express)
│   ├── controllers/         # Controllers xử lý logic
│   ├── models/             # Models MongoDB
│   ├── routes/             # API routes
│   ├── middleware/         # Middleware (auth, upload, etc.)
│   ├── config/             # Cấu hình (database, cloudinary, etc.)
│   └── server.js           # Entry point backend
├── frontend/               # Frontend application
│   └── web/                # React web application
│       ├── src/
│       │   ├── admin/      # Admin dashboard
│       │   ├── components/ # Shared components
│       │   └── pages/      # User pages
│       └── public/
└── db/                     # Database exports/backups
```

## Tính năng chính

### Backend
- **Authentication & Authorization**: JWT token, role-based access
- **Product Management**: CRUD sản phẩm với hình ảnh (Cloudinary)
- **Order Management**: Quản lý đơn hàng với real-time updates
- **Payment Integration**: VNPay payment gateway
- **Real-time Features**: Socket.io cho thông báo real-time
- **Dashboard Analytics**: Thống kê doanh thu, lợi nhuận
- **Banner Management**: Quản lý banner quảng cáo
- **Chat System**: Hệ thống chat customer support

### Frontend
- **User Interface**: Modern responsive design
- **Admin Dashboard**: Comprehensive admin panel
- **Real-time Notifications**: Live updates cho admin
- **Shopping Cart**: Advanced cart functionality
- **Order Tracking**: Real-time order status updates
- **Product Catalog**: Advanced product browsing

## Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js (v14 trở lên)
- MongoDB
- npm hoặc yarn

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend/web
npm install
npm start
```

## Cấu hình môi trường

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
VNPAY_TMN_CODE=your_vnpay_code
VNPAY_SECRET_KEY=your_vnpay_secret
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/bill/all` - Get all orders (Admin)
- `POST /api/bill` - Create order
- `PUT /api/bill/:id/status` - Update order status (Admin)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (Admin)

## Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time communication
- **Cloudinary** - Image storage
- **JWT** - Authentication
- **Multer** - File upload

### Frontend
- **React** - UI library
- **Material-UI** - UI components
- **Axios** - HTTP client
- **Socket.io-client** - Real-time client
- **React Hot Toast** - Notifications

## Tác giả
Dự án được phát triển bởi team Kaze Website.

## License
MIT License
