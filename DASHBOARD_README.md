# Dashboard Admin - Hướng dẫn sử dụng

## Tổng quan
Dashboard admin cung cấp các thống kê quan trọng để quản lý website bán hàng, bao gồm:
- Tổng doanh thu
- Top khách hàng mua nhiều nhất
- Top sản phẩm bán chạy nhất
- Đơn hàng mới nhất
- Thống kê theo ngày

## Tính năng chính

### 1. Thống kê tổng quan
- **Tổng đơn hàng**: Số lượng đơn hàng trong khoảng thời gian được chọn
- **Tổng doanh thu**: Tổng doanh thu từ tất cả đơn hàng
- **Đơn hoàn thành**: Số đơn hàng đã hoàn thành (đã giao hàng, đã nhận hàng, hoàn thành)
- **Doanh thu hoàn thành**: Doanh thu từ các đơn hàng đã hoàn thành

### 2. Biểu đồ doanh thu theo ngày
- Hiển thị doanh thu theo từng ngày
- Tự động điều chỉnh theo khoảng thời gian được chọn
- Mặc định hiển thị 7 ngày gần nhất nếu không có filter

### 3. Top 3 khách hàng mua nhiều nhất
- Hiển thị tên khách hàng
- Số lượng đơn hàng
- Tổng số tiền đã chi

### 4. Top 3 sản phẩm bán chạy nhất
- Tên sản phẩm
- Số lượng đã bán
- Doanh thu từ sản phẩm

### 5. Đơn hàng mới nhất
- Thông tin khách hàng
- Tổng tiền đơn hàng
- Trạng thái đơn hàng
- Ngày đặt hàng

## Cách sử dụng

### Lọc theo ngày
1. Chọn "Từ ngày" để bắt đầu khoảng thời gian
2. Chọn "Đến ngày" để kết thúc khoảng thời gian
3. Dữ liệu sẽ tự động cập nhật theo khoảng thời gian được chọn
4. Nhấn "Xóa filter" để xem dữ liệu tất cả thời gian

### Ví dụ lọc theo ngày:
- **Hôm qua**: Từ ngày = hôm qua, Đến ngày = hôm qua
- **Tuần này**: Từ ngày = đầu tuần, Đến ngày = cuối tuần
- **Tháng này**: Từ ngày = đầu tháng, Đến ngày = cuối tháng
- **Tùy chỉnh**: Chọn bất kỳ khoảng thời gian nào

## API Endpoints

### 1. Thống kê tổng hợp
```
GET /api/dashboard/stats
Query params: startDate, endDate (optional)
```

### 2. Thống kê doanh thu
```
GET /api/dashboard/revenue
Query params: startDate, endDate (optional)
```

### 3. Top khách hàng
```
GET /api/dashboard/top-users
Query params: startDate, endDate, limit (optional, default: 5)
```

### 4. Top sản phẩm
```
GET /api/dashboard/top-products
Query params: startDate, endDate, limit (optional, default: 5)
```

### 5. Đơn hàng mới nhất
```
GET /api/dashboard/latest-orders
Query params: startDate, endDate, limit (optional, default: 5)
```

## Yêu cầu quyền truy cập
- Tất cả API đều yêu cầu authentication
- Chỉ admin mới có quyền truy cập dashboard
- Token phải được gửi trong header: `Authorization: Bearer <token>`

## Cài đặt và chạy

### Backend
1. Đảm bảo MongoDB đã được kết nối
2. Chạy server: `npm start` hoặc `node server.js`
3. Server sẽ chạy trên port 5000

### Frontend
1. Vào thư mục frontend/web
2. Cài đặt dependencies: `npm install`
3. Chạy ứng dụng: `npm start`
4. Truy cập admin panel: `http://localhost:3000/admin`

## Lưu ý
- Dashboard chỉ hiển thị dữ liệu từ các đơn hàng có trạng thái "đã giao hàng", "đã nhận hàng", "hoàn thành"
- Dữ liệu được cập nhật real-time khi có thay đổi
- Có thể mất vài giây để load dữ liệu lần đầu tiên
- Đảm bảo có dữ liệu đơn hàng trong database để hiển thị thống kê

## Troubleshooting

### Lỗi "Không thể tải dữ liệu dashboard"
- Kiểm tra kết nối database
- Kiểm tra token authentication
- Kiểm tra quyền admin

### Dashboard trống
- Kiểm tra có dữ liệu đơn hàng trong database không
- Kiểm tra trạng thái đơn hàng có đúng không
- Thử xóa filter ngày để xem tất cả dữ liệu

### Lỗi API
- Kiểm tra server có đang chạy không
- Kiểm tra URL API có đúng không
- Kiểm tra console để xem lỗi chi tiết 