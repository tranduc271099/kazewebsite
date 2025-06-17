# Tính năng Lịch sử Chỉnh sửa Tài khoản

## Mô tả
Tính năng này cho phép admin xem lịch sử chỉnh sửa của từng tài khoản người dùng, bao gồm:
- Thời gian chỉnh sửa
- Người thực hiện chỉnh sửa
- Các thay đổi được thực hiện

## Các thay đổi được ghi lại
1. **Thông tin cá nhân**: Tên, email, vai trò
2. **Trạng thái tài khoản**: Khóa/mở khóa tài khoản
3. **Tạo tài khoản mới**: Ghi lại khi admin tạo tài khoản mới

## Cách sử dụng

### 1. Xem lịch sử chỉnh sửa
- Đăng nhập vào admin panel
- Vào trang "Quản lý tài khoản"
- Nhấn nút "Lịch sử" (biểu tượng đồng hồ) bên cạnh tên người dùng
- Modal sẽ hiển thị danh sách các thay đổi theo thứ tự thời gian

### 2. Thông tin hiển thị
- **Thời gian**: Định dạng dd/MM/yyyy HH:mm:ss
- **Người chỉnh sửa**: Tên và email của admin thực hiện thay đổi
- **Thay đổi**: Mô tả chi tiết các thay đổi được thực hiện

## Cấu trúc dữ liệu

### Model UserHistory
```javascript
{
  userId: ObjectId,        // ID của user được chỉnh sửa
  updatedBy: ObjectId,     // ID của admin thực hiện chỉnh sửa
  updatedAt: Date,         // Thời gian chỉnh sửa
  changes: {
    name: String,          // Tên mới (nếu có thay đổi)
    email: String,         // Email mới (nếu có thay đổi)
    role: String,          // Vai trò mới (nếu có thay đổi)
    isLocked: Boolean      // Trạng thái khóa (nếu có thay đổi)
  }
}
```

## API Endpoints

### Lấy lịch sử chỉnh sửa
```
GET /api/users/admin/users/:userId/history
Headers: Authorization: Bearer <token>
```

### Lưu lịch sử chỉnh sửa
```
POST /api/users/admin/user-history
Headers: Authorization: Bearer <token>
Body: {
  userId: String,
  updatedBy: String,
  updatedAt: Date,
  changes: Object
}
```

## Tính năng bảo mật
- Chỉ admin mới có quyền xem lịch sử chỉnh sửa
- Lịch sử được lưu tự động khi có thay đổi
- Không thể xóa hoặc chỉnh sửa lịch sử

## Giao diện
- Modal responsive với thiết kế Bootstrap
- Bảng hiển thị thông tin rõ ràng
- Loading state khi tải dữ liệu
- Thông báo lỗi nếu có vấn đề
- Icon trực quan cho từng loại thông tin 