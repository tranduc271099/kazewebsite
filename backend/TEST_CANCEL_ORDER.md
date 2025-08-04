# TEST CHỨC NĂNG HỦY ĐƠN HÀNG

## Tính năng mới đã được thêm:

### 1. Hủy đơn hàng với lý do bắt buộc
- ✅ Cả Admin và User đều có thể hủy đơn hàng
- ✅ Lý do hủy là bắt buộc (không được để trống)
- ✅ Ghi nhận người hủy (Admin/User) và thông tin người hủy

### 2. Trạng thái có thể hủy được mở rộng
- ✅ `chờ xác nhận` - có thể hủy
- ✅ `đã xác nhận` - có thể hủy (MỚI)
- ✅ `đang giao hàng` - có thể hủy (MỚI)
- ❌ `đã giao hàng` - không thể hủy
- ❌ `đã nhận hàng` - không thể hủy
- ❌ `hoàn thành` - không thể hủy
- ❌ `đã hủy` - đã hủy rồi

### 3. API Endpoints:

#### User hủy đơn hàng:
```
PUT /api/bill/:id/cancel
Headers: Authorization: Bearer <user_token>
Body: {
  "ly_do_huy": "Tôi không cần nữa"
}
```

#### Admin hủy đơn hàng:
```
PUT /api/bill/:id/admin-cancel
Headers: Authorization: Bearer <admin_token>
Body: {
  "ly_do_huy": "Khách hàng yêu cầu hủy qua điện thoại"
}
```

#### Admin hủy qua cập nhật trạng thái:
```
PUT /api/bill/:id/status
Headers: Authorization: Bearer <admin_token>
Body: {
  "trang_thai": "đã hủy",
  "ly_do_huy": "Sản phẩm hết hàng"
}
```

### 4. Tính năng bổ sung:
- ✅ Hoàn kho tự động khi hủy đơn hàng
- ✅ Gửi email thông báo hủy đơn hàng
- ✅ Real-time notification cho admin
- ✅ Response nhanh (email gửi bất đồng bộ)

## Cách test:

1. **Tạo đơn hàng mới**
2. **Admin chuyển trạng thái thành "đã xác nhận"**
3. **User hoặc Admin thử hủy với lý do**
4. **Kiểm tra email thông báo**
5. **Kiểm tra kho được hoàn chưa**

## Lưu ý:
- Lý do hủy là bắt buộc và không được để trống
- Email thông báo được gửi bất đồng bộ để tăng tốc độ response
- Kho được hoàn tự động khi hủy đơn hàng
