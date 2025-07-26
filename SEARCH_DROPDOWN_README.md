# Dropdown Tìm kiếm - Header Search Feature

## Tổng quan
Đã thêm dropdown tìm kiếm vào header giống như trong ảnh mẫu, thay thế thanh tìm kiếm thông thường bằng một dropdown đẹp mắt và hiện đại.

## Tính năng chính

### 🔍 **Dropdown Tìm kiếm**
- Icon tìm kiếm trong header
- Click để mở dropdown tìm kiếm
- Giao diện đẹp với animation
- Auto-focus vào input khi mở
- Click outside để đóng dropdown

### 🎨 **Thiết kế hiện đại**
- Dropdown với shadow và border radius
- Arrow pointer phía trên
- Animation slide down khi mở
- Hover effects cho icon và button
- Responsive design

### 📱 **Responsive**
- Desktop: Dropdown 400px width
- Tablet: Dropdown 300px width  
- Mobile: Dropdown 280px width
- Tự động điều chỉnh padding và font size

## Các thay đổi đã thực hiện

### 1. Cập nhật Header Component
- **File**: `frontend/web/src/client/components/Header.jsx`
- **Thay đổi**:
  - Thêm state `isSearchOpen` và `searchTerm`
  - Thêm `useRef` cho search container
  - Thêm `useEffect` để handle click outside
  - Thêm `handleSearchSubmit` function
  - Thay thế thanh tìm kiếm bằng icon + dropdown

### 2. Thêm CSS cho Dropdown
- **File**: `frontend/web/src/client/styles/Header.css`
- **Tính năng**:
  - `.search-container`: Container cho search icon
  - `.search-toggle`: Icon button với hover effects
  - `.search-dropdown`: Dropdown container với animation
  - `.search-dropdown::before`: Arrow pointer
  - Responsive styles cho mobile và tablet

### 3. Xóa link "Liên hệ"
- Đã xóa link "Liên hệ" khỏi navigation
- Thay thế bằng chức năng tìm kiếm

## Luồng hoạt động

### Mở dropdown:
1. User click vào icon tìm kiếm trong header
2. Dropdown hiển thị với animation slide down
3. Input field được auto-focus
4. User có thể nhập từ khóa tìm kiếm

### Tìm kiếm:
1. User nhập từ khóa và nhấn Enter hoặc click button
2. Form submit → chuyển hướng đến `/search?q=keyword`
3. Dropdown tự động đóng
4. Input field được reset

### Đóng dropdown:
1. User click outside dropdown
2. User nhấn Escape key (có thể thêm)
3. User submit form tìm kiếm

## Giao diện

### Desktop (>991px):
```
┌─────────────────────────────────────────────────────────┐
│ Logo    [🔍]    Nav Links    Cart    User Menu         │
│         │                                                │
│         ▼                                                │
│    ┌─────────────────────────────────────────────────┐   │
│    │                    TÌM KIẾM                    │   │
│    │  ┌─────────────────────────────────────────┐   │   │
│    │  │ Tìm kiếm sản phẩm...              [🔍] │   │   │
│    │  └─────────────────────────────────────────┘   │   │
│    └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Mobile (<576px):
```
┌─────────────────────────────────────────┐
│ Logo    [🔍]    Cart    User Menu       │
│         │                                │
│         ▼                                │
│    ┌─────────────────────────────────┐   │
│    │            TÌM KIẾM            │   │
│    │  ┌─────────────────────────┐   │   │
│    │  │ Tìm kiếm sản phẩm...    │   │   │
│    │  │                    [🔍] │   │   │
│    │  └─────────────────────────┘   │   │
│    └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## CSS Classes

### Container:
```css
.search-container {
    position: relative;
}
```

### Toggle Button:
```css
.search-toggle {
    transition: all 0.3s ease;
}

.search-toggle:hover {
    color: #007bff;
    transform: scale(1.1);
}
```

### Dropdown:
```css
.search-dropdown {
    animation: slideDown 0.3s ease;
    /* Inline styles for positioning */
}

.search-dropdown::before {
    /* Arrow pointer */
}
```

### Animation:
```css
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateX(-50%) translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
}
```

## JavaScript Logic

### State Management:
```javascript
const [isSearchOpen, setIsSearchOpen] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const searchRef = useRef(null);
```

### Click Outside Handler:
```javascript
useEffect(() => {
    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setIsSearchOpen(false);
        }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

### Form Submit:
```javascript
const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        setIsSearchOpen(false);
        setSearchTerm('');
    }
};
```

## Responsive Breakpoints

### Desktop (>991px):
- Dropdown width: 400px
- Full padding: 20px
- Normal font sizes

### Tablet (576px-991px):
- Dropdown width: 300px
- Normal padding
- Normal font sizes

### Mobile (<576px):
- Dropdown width: 280px
- Reduced padding: 15px
- Smaller font sizes
- Stacked input and button

## Testing

### Manual Testing:
```bash
# Test dropdown mở/đóng
1. Click icon tìm kiếm → dropdown mở
2. Click outside → dropdown đóng
3. Nhập text và submit → chuyển đến trang search

# Test responsive
1. Resize browser window
2. Test trên mobile device
3. Verify dropdown size và layout

# Test accessibility
1. Tab navigation
2. Keyboard navigation
3. Screen reader compatibility
```

### Test Cases:
1. **Dropdown Toggle**: Click icon để mở/đóng
2. **Click Outside**: Click outside để đóng
3. **Form Submit**: Nhập text và submit
4. **Auto Focus**: Input được focus khi mở
5. **Reset State**: Input reset sau khi submit
6. **Responsive**: Test trên các kích thước màn hình
7. **Animation**: Verify slide down animation
8. **Hover Effects**: Test hover trên icon và button

## Future Enhancements

### Có thể thêm:
1. **Keyboard Support**: Escape key để đóng
2. **Search Suggestions**: Auto-complete dropdown
3. **Search History**: Lưu lịch sử tìm kiếm
4. **Voice Search**: Tìm kiếm bằng giọng nói
5. **Search Analytics**: Track search queries
6. **Advanced Filters**: Quick filters trong dropdown
7. **Search Loading**: Loading state khi submit
8. **Search Results Preview**: Preview kết quả trong dropdown

## Troubleshooting

### Lỗi thường gặp:
1. **Dropdown không mở**: Kiểm tra click handler và state
2. **Click outside không hoạt động**: Kiểm tra useRef và event listener
3. **Animation không chạy**: Kiểm tra CSS animation
4. **Responsive không đúng**: Kiểm tra media queries
5. **Z-index issues**: Kiểm tra z-index của dropdown

### Debug:
- Kiểm tra Console để xem errors
- Kiểm tra React DevTools để xem state
- Kiểm tra CSS để xem styles
- Test trên các browser khác nhau

## Performance

### Optimizations:
- `useRef` để tránh re-render không cần thiết
- `useEffect` cleanup để tránh memory leaks
- CSS animations thay vì JavaScript animations
- Minimal state updates

### Best Practices:
- Debounced search (có thể thêm)
- Lazy loading cho search results
- Efficient event handling
- Proper cleanup trong useEffect 