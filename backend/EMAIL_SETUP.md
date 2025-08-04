# Hướng dẫn cấu hình Email Service cho KazeWebsite

## 1. Cấu hình Gmail để gửi email

### Bước 1: Bật xác thực 2 bước cho Gmail
1. Đăng nhập vào tài khoản Gmail của bạn
2. Truy cập: https://myaccount.google.com/security
3. Bật "2-Step Verification" (Xác minh 2 bước)

### Bước 2: Tạo App Password
1. Sau khi bật 2-Step Verification, vào: https://myaccount.google.com/apppasswords
2. Chọn "Select app" → "Mail"
3. Chọn "Select device" → "Other (custom name)"
4. Nhập tên: "KazeWebsite Backend"
5. Nhấn "Generate" và sao chép mật khẩu ứng dụng (16 ký tự)

### Bước 3: Cập nhật file .env
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

## 2. Các tính năng Email đã được tích hợp

### Email xác nhận đơn hàng
- Tự động gửi khi khách hàng đặt hàng thành công
- Bao gồm: thông tin đơn hàng, sản phẩm, địa chỉ giao hàng, tổng tiền

### Email thông báo thay đổi trạng thái
- Tự động gửi khi admin cập nhật trạng thái đơn hàng
- Các trạng thái: đang xử lý, đã xác nhận, đang giao hàng, đã giao hàng, hoàn thành, đã hủy

## 3. Test Email Service

Để test email service, bạn có thể:

1. Đặt một đơn hàng mới → Email xác nhận sẽ được gửi
2. Cập nhật trạng thái đơn hàng từ admin panel → Email thông báo sẽ được gửi

## 4. Template Email

Email được thiết kế với:
- Giao diện đẹp, responsive
- Logo và branding KazeWebsite
- Thông tin đầy đủ về đơn hàng
- Định dạng tiền tệ Việt Nam
- Hướng dẫn tiếp theo cho khách hàng

## 5. Lưu ý khi sử dụng

- Email sẽ không ảnh hưởng đến luồng xử lý chính nếu có lỗi
- Tất cả lỗi email đều được log để debug
- Có thể dễ dàng customize template email trong file `services/emailService.js`

## 6. Troubleshooting

### Nếu email không được gửi:
1. Kiểm tra file .env có đúng EMAIL_USER và EMAIL_PASS
2. Kiểm tra console log để xem lỗi cụ thể
3. Đảm bảo Gmail đã bật 2-Step Verification và tạo App Password
4. Kiểm tra kết nối internet

### Nếu email vào spam:
1. Thêm địa chỉ email vào danh sách tin cậy
2. Cân nhắc sử dụng domain email riêng thay vì Gmail
3. Cấu hình SPF, DKIM records nếu sử dụng domain riêng
