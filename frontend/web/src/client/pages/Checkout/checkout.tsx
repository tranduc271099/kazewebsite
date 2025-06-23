import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { CartContext } from '../../context/CartContext';
import axios from 'axios';

interface AuthState {
    isAuthenticated: boolean;
    user: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
        address?: string;
    } | null;
    token: string | null;
}

interface RootState {
    auth: AuthState;
}

interface UserData {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

// Dữ liệu địa chỉ Việt Nam
const vietnamAddressData = {
    'hanoi': {
        name: 'Hà Nội',
        districts: {
            'ba-dinh': { name: 'Ba Đình', wards: ['phuc-xa', 'trung-tu', 'ngoc-khanh', 'kim-ma'] },
            'hoan-kiem': { name: 'Hoàn Kiếm', wards: ['hang-bac', 'hang-bai', 'hang-buom', 'hang-dao'] },
            'tay-ho': { name: 'Tây Hồ', wards: ['buoi', 'thuy-khue', 'yen-phu', 'quang-an'] },
            'long-bien': { name: 'Long Biên', wards: ['bo-de', 'duc-giang', 'gia-thuy', 'ngoc-lam'] },
            'cau-giay': { name: 'Cầu Giấy', wards: ['dich-vong', 'dich-vong-hau', 'mai-dich', 'nghia-do'] },
            'dong-da': { name: 'Đống Đa', wards: ['cat-linh', 'van-mieu', 'quoc-tu-giam', 'lang-ha'] },
            'hai-ba-trung': { name: 'Hai Bà Trưng', wards: ['nguyen-du', 'bach-khoa', 'bach-mai', 'dong-nhan'] },
            'hoang-mai': { name: 'Hoàng Mai', wards: ['giang-bien', 'linh-nam', 'mai-dong', 'tan-mai'] },
            'thanh-xuan': { name: 'Thanh Xuân', wards: ['kim-giang', 'nguyen-trai', 'phuong-liet', 'thanh-xuan-bac'] }
        }
    },
    'hcm': {
        name: 'TP. Hồ Chí Minh',
        districts: {
            'district-1': { name: 'Quận 1', wards: ['ben-nghe', 'ben-thanh', 'cau-kho', 'cau-ong-lanh'] },
            'district-2': { name: 'Quận 2', wards: ['an-khanh', 'an-loi-dong', 'an-phu', 'binh-an'] },
            'district-3': { name: 'Quận 3', wards: ['phuong-1', 'phuong-2', 'phuong-3', 'phuong-4'] },
            'district-4': { name: 'Quận 4', wards: ['phuong-1', 'phuong-2', 'phuong-3', 'phuong-4'] },
            'district-5': { name: 'Quận 5', wards: ['phuong-1', 'phuong-2', 'phuong-3', 'phuong-4'] },
            'district-6': { name: 'Quận 6', wards: ['phuong-1', 'phuong-2', 'phuong-3', 'phuong-4'] },
            'district-7': { name: 'Quận 7', wards: ['binh-thuan', 'phu-my', 'phu-thuan', 'tan-phu'] },
            'district-8': { name: 'Quận 8', wards: ['phuong-1', 'phuong-2', 'phuong-3', 'phuong-4'] },
            'district-9': { name: 'Quận 9', wards: ['long-binh', 'long-phuoc', 'long-thanh-my', 'long-truong'] },
            'district-10': { name: 'Quận 10', wards: ['phuong-1', 'phuong-2', 'phuong-3', 'phuong-4'] },
            'district-11': { name: 'Quận 11', wards: ['phuong-1', 'phuong-2', 'phuong-3', 'phuong-4'] },
            'district-12': { name: 'Quận 12', wards: ['an-phu-dong', 'dong-hung-thuan', 'hiep-thanh', 'tan-chanh-hiep'] }
        }
    },
    'danang': {
        name: 'Đà Nẵng',
        districts: {
            'hai-chau': { name: 'Hải Châu', wards: ['hai-chau-1', 'hai-chau-2', 'nam-duong', 'phuoc-ninh'] },
            'thanh-khe': { name: 'Thanh Khê', wards: ['an-khe', 'chinh-gian', 'hoa-khe', 'tan-chinh'] },
            'son-tra': { name: 'Sơn Trà', wards: ['an-hai-bac', 'an-hai-dong', 'man-thai', 'nai-hien-dong'] },
            'ngu-hanh-son': { name: 'Ngũ Hành Sơn', wards: ['hoa-hai', 'hoa-quy', 'khue-my', 'my-an'] },
            'lien-chieu': { name: 'Liên Chiểu', wards: ['hoa-hiep-bac', 'hoa-hiep-nam', 'hoa-khanh-bac', 'hoa-khanh-nam'] },
            'cam-le': { name: 'Cẩm Lệ', wards: ['hoa-an', 'hoa-phat', 'hoa-tho-dong', 'hoa-tho-tay'] }
        }
    },
    'haiphong': {
        name: 'Hải Phòng',
        districts: {
            'hong-bang': { name: 'Hồng Bàng', wards: ['hoang-van-thu', 'minh-khai', 'pham-hong-thai', 'quan-toan'] },
            'ngo-quyen': { name: 'Ngô Quyền', wards: ['cau-dat', 'cau-tre', 'dong-khe', 'le-loi'] },
            'le-chan': { name: 'Lê Chân', wards: ['an-bien', 'cat-dai', 'cat-lam', 'du-hang'] },
            'hai-an': { name: 'Hải An', wards: ['cat-bi', 'dang-hai', 'hai-an', 'trang-cat'] },
            'kien-an': { name: 'Kiến An', wards: ['bai-chay', 'cao-nhan', 'doan-xa', 'duong-quan'] },
            'do-son': { name: 'Đồ Sơn', wards: ['bang-la', 'do-son', 'hop-duc', 'minh-duc'] }
        }
    },
    'can-tho': {
        name: 'Cần Thơ',
        districts: {
            'ninh-kieu': { name: 'Ninh Kiều', wards: ['an-binh', 'an-cu', 'an-hoi', 'an-khanh'] },
            'binh-thuy': { name: 'Bình Thủy', wards: ['an-thoi', 'binh-thuy', 'bui-huu-nghia', 'long-hoa'] },
            'cai-rang': { name: 'Cái Răng', wards: ['le-binh', 'phu-an', 'phu-thu', 'tan-an'] },
            'o-mon': { name: 'Ô Môn', wards: ['chanh-an', 'le-binh', 'long-hoa', 'thoi-lai'] },
            'thot-not': { name: 'Thốt Nốt', wards: ['thot-not', 'thoi-lai', 'vinh-thanh', 'vinh-trinh'] }
        }
    }
};

const Checkout = () => {
    const { cartItems, clearCart } = useContext(CartContext);
    const auth = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        district: '',
        ward: '',
        note: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [shipping, setShipping] = useState(4990);
    const [total, setTotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [availableDistricts, setAvailableDistricts] = useState<{[key: string]: any}>({});
    const [availableWards, setAvailableWards] = useState<{[key: string]: any}>({});
    const [errors, setErrors] = useState({
        fullName: '',
        email: '',
        address: ''
    });

    useEffect(() => {
        const fetchProfileForCheckout = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await axios.get('http://localhost:5000/api/users/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const user = res.data;
                    setUserData(user);
                    setFormData(prev => ({
                        ...prev,
                        fullName: user.name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        address: user.address || ''
                    }));
                } catch (err) {
                    console.error("Failed to fetch user profile for checkout", err);
                    toast.error("Không thể tải thông tin người dùng.");
                    if (err.response?.status === 401) {
                        navigate('/login');
                    }
                }
            } else {
                navigate('/login');
            }
        };

        fetchProfileForCheckout();
    }, [navigate]);

    useEffect(() => {
        const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const taxValue = Math.round(subtotal * 0.1);
        setTax(taxValue);
        setTotal(subtotal + shipping + taxValue - discount);
    }, [cartItems, shipping, tax, discount]);

    // Cập nhật quận/huyện khi chọn tỉnh/thành phố
    useEffect(() => {
        if (formData.city && vietnamAddressData[formData.city]) {
            setAvailableDistricts(vietnamAddressData[formData.city].districts);
            setFormData(prev => ({ ...prev, district: '', ward: '' }));
        } else {
            setAvailableDistricts({});
            setAvailableWards({});
        }
    }, [formData.city]);

    // Cập nhật phường/xã khi chọn quận/huyện
    useEffect(() => {
        if (formData.district && availableDistricts[formData.district]) {
            setAvailableWards(availableDistricts[formData.district].wards);
            setFormData(prev => ({ ...prev, ward: '' }));
        } else {
            setAvailableWards({});
        }
    }, [formData.district, availableDistricts]);

    useEffect(() => {
        // Xóa toast, không hiện thông báo popup nữa
    }, [cartItems]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validate = () => {
        let valid = true;
        const newErrors = { fullName: '', email: '', address: '' };
        // Họ tên: không số, dưới 20 ký tự
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ và tên';
            valid = false;
        } else if (/\d/.test(formData.fullName)) {
            newErrors.fullName = 'Họ tên không được chứa số';
            valid = false;
        } else if (formData.fullName.length > 20) {
            newErrors.fullName = 'Họ tên không được quá 20 ký tự';
            valid = false;
        }
        // Email phải có @
        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
            valid = false;
        } else if (!formData.email.includes('@')) {
            newErrors.email = 'Email không hợp lệ';
            valid = false;
        }
        // Địa chỉ bắt buộc
        if (!formData.address.trim()) {
            newErrors.address = 'Vui lòng nhập địa chỉ';
            valid = false;
        }
        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        if (!userData) {
            toast.error('Bạn cần đăng nhập để đặt hàng.');
            navigate('/login');
            return;
        }

        const fullAddress = `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`;

        const billData = {
            dia_chi_giao_hang: fullAddress,
            phuong_thuc_thanh_toan: paymentMethod.toUpperCase(),
            ghi_chu: formData.note,
            shippingFee: shipping
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/bill', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(billData)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Đặt hàng thành công!');
                await clearCart();
                navigate('/bill');
            } else {
                toast.error(result.message || 'Có lỗi xảy ra, vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            toast.error('Không thể kết nối đến server.');
        }
    };

    return (
        <>
            <div className="page-title light-background" style={{ paddingTop: 100, marginBottom: 0 }}>
                <div className="container d-lg-flex justify-content-between align-items-center">
                    <h1 className="mb-2 mb-lg-0" style={{ fontWeight: 700, fontSize: '28px', textTransform: 'none', letterSpacing: 0 }}>Thanh toán</h1>
                    <nav className="breadcrumbs">
                        <ol>
                            <li><a href="/">Home</a></li>
                            <li><a href="/cart">Cart</a></li>
                            <li className="current">Checkout</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="checkout-page-container py-5" style={{ width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', background: '#fff', marginTop: 0 }}>
                <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px' }}>
                    <div className="row justify-content-center" style={{ marginTop: '20px' }}>
                        {cartItems.length === 0 ? (
                            <div className="col-12 text-center py-5">
                                <div style={{ fontSize: 32, fontWeight: 700, color: '#e53935', marginBottom: 16 }}>
                                    Bạn chưa có sản phẩm ở giỏ hàng
                                </div>
                                <Link to="/category" className="btn btn-primary" style={{ fontSize: 18, padding: '10px 32px' }}>
                                    Quay lại trang sản phẩm
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Form thanh toán bên trái */}
                                <div className="col-lg-8 mb-4">
                                    <div className="card shadow-sm border-0">
                                        <div className="card-body p-4">
                                            <h4 className="mb-4" style={{ fontWeight: 600 }}>THÔNG TIN THANH TOÁN</h4>
                                            <form onSubmit={handleSubmit}>
                                                {/* Thông tin cá nhân */}
                                                <div className="mb-4">
                                                    <h5 className="mb-3" style={{ fontWeight: 600, color: '#333' }}>Thông tin cá nhân</h5>
                                                    <div className="row">
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Họ và tên *</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="fullName"
                                                                value={formData.fullName}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                            {errors.fullName && <div style={{ color: 'red', fontSize: 13, marginTop: 2 }}>{errors.fullName}</div>}
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Số điện thoại *</label>
                                                            <input
                                                                type="tel"
                                                                className="form-control"
                                                                name="phone"
                                                                value={formData.phone}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-6 mb-3">
                                                            <label className="form-label">Email *</label>
                                                            <input
                                                                type="email"
                                                                className="form-control"
                                                                name="email"
                                                                value={formData.email}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                            {errors.email && <div style={{ color: 'red', fontSize: 13, marginTop: 2 }}>{errors.email}</div>}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Địa chỉ giao hàng */}
                                                <div className="mb-4">
                                                    <h5 className="mb-3" style={{ fontWeight: 600, color: '#333' }}>Địa chỉ giao hàng</h5>
                                                    <div className="mb-3">
                                                        <label className="form-label">Địa chỉ *</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="address"
                                                            value={formData.address}
                                                            onChange={handleInputChange}
                                                            placeholder="Số nhà, tên đường, phường/xã"
                                                            required
                                                        />
                                                        {errors.address && <div style={{ color: 'red', fontSize: 13, marginTop: 2 }}>{errors.address}</div>}
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-4 mb-3">
                                                            <label className="form-label">Tỉnh/Thành phố *</label>
                                                            <select
                                                                className="form-select"
                                                                name="city"
                                                                value={formData.city}
                                                                onChange={handleInputChange}
                                                                required
                                                            >
                                                                <option value="">Chọn tỉnh/thành phố</option>
                                                                {Object.entries(vietnamAddressData).map(([key, city]) => (
                                                                    <option key={key} value={key}>{city.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="col-md-4 mb-3">
                                                            <label className="form-label">Quận/Huyện *</label>
                                                            <select
                                                                className="form-select"
                                                                name="district"
                                                                value={formData.district}
                                                                onChange={handleInputChange}
                                                                required
                                                                disabled={!formData.city}
                                                            >
                                                                <option value="">Chọn quận/huyện</option>
                                                                {Object.entries(availableDistricts).map(([key, district]) => (
                                                                    <option key={key} value={key}>{district.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="col-md-4 mb-3">
                                                            <label className="form-label">Phường/Xã *</label>
                                                            <select
                                                                className="form-select"
                                                                name="ward"
                                                                value={formData.ward}
                                                                onChange={handleInputChange}
                                                                required
                                                                disabled={!formData.district}
                                                            >
                                                                <option value="">Chọn phường/xã</option>
                                                                {Object.entries(availableWards).map(([key, ward]) => (
                                                                    <option key={key} value={ward}>{ward}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Phương thức vận chuyển */}
                                                <div className="mb-4">
                                                    <h5 className="mb-3" style={{ fontWeight: 600, color: '#333' }}>Phương thức vận chuyển</h5>
                                                    <div className="row">
                                                        <div className="col-md-4 mb-3">
                                                            <div 
                                                                className={`card h-100 border-2 ${shipping === 4990 ? 'border-primary' : 'border-light'}`}
                                                                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                                                onClick={() => setShipping(4990)}
                                                            >
                                                                <div className="card-body text-center p-3">
                                                                    <div className="mb-2">
                                                                        <i className="bi bi-truck" style={{ fontSize: '24px', color: shipping === 4990 ? '#0d6efd' : '#6c757d' }}></i>
                                                                    </div>
                                                                    <h6 className="card-title mb-1" style={{ fontSize: '14px', fontWeight: 600 }}>Tiêu chuẩn</h6>
                                                                    <p className="card-text mb-1" style={{ fontSize: '12px', color: '#666' }}>3-5 ngày</p>
                                                                    <p className="card-text" style={{ fontSize: '14px', fontWeight: 600, color: '#e53935' }}>
                                                                        {(4990).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                                    </p>
                                                                    <input
                                                                        type="radio"
                                                                        name="shipping"
                                                                        checked={shipping === 4990}
                                                                        onChange={() => setShipping(4990)}
                                                                        style={{ position: 'absolute', opacity: 0 }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4 mb-3">
                                                            <div 
                                                                className={`card h-100 border-2 ${shipping === 12990 ? 'border-primary' : 'border-light'}`}
                                                                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                                                onClick={() => setShipping(12990)}
                                                            >
                                                                <div className="card-body text-center p-3">
                                                                    <div className="mb-2">
                                                                        <i className="bi bi-lightning" style={{ fontSize: '24px', color: shipping === 12990 ? '#0d6efd' : '#6c757d' }}></i>
                                                                    </div>
                                                                    <h6 className="card-title mb-1" style={{ fontSize: '14px', fontWeight: 600 }}>Nhanh</h6>
                                                                    <p className="card-text mb-1" style={{ fontSize: '12px', color: '#666' }}>1-2 ngày</p>
                                                                    <p className="card-text" style={{ fontSize: '14px', fontWeight: 600, color: '#e53935' }}>
                                                                        {(12990).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                                    </p>
                                                                    <input
                                                                        type="radio"
                                                                        name="shipping"
                                                                        checked={shipping === 12990}
                                                                        onChange={() => setShipping(12990)}
                                                                        style={{ position: 'absolute', opacity: 0 }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4 mb-3">
                                                            <div 
                                                                className={`card h-100 border-2 ${shipping === 0 ? 'border-primary' : 'border-light'} ${cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) < 300000 ? 'opacity-50' : ''}`}
                                                                style={{ cursor: cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) < 300000 ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease' }}
                                                                onClick={() => {
                                                                    if (cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) >= 300000) {
                                                                        setShipping(0);
                                                                    }
                                                                }}
                                                            >
                                                                <div className="card-body text-center p-3">
                                                                    <div className="mb-2">
                                                                        <i className="bi bi-gift" style={{ fontSize: '24px', color: shipping === 0 ? '#0d6efd' : '#6c757d' }}></i>
                                                                    </div>
                                                                    <h6 className="card-title mb-1" style={{ fontSize: '14px', fontWeight: 600 }}>Miễn phí</h6>
                                                                    <p className="card-text mb-1" style={{ fontSize: '12px', color: '#666' }}>Đơn trên 300k</p>
                                                                    <p className="card-text" style={{ fontSize: '14px', fontWeight: 600, color: '#28a745' }}>
                                                                        Miễn phí
                                                                    </p>
                                                                    <input
                                                                        type="radio"
                                                                        name="shipping"
                                                                        checked={shipping === 0}
                                                                        onChange={() => setShipping(0)}
                                                                        disabled={cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) < 300000}
                                                                        style={{ position: 'absolute', opacity: 0 }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Phương thức thanh toán */}
                                                <div className="mb-4">
                                                    <h5 className="mb-3" style={{ fontWeight: 600, color: '#333' }}>Phương thức thanh toán</h5>
                                                    <div className="row">
                                                        <div className="col-md-6 mb-3">
                                                            <div 
                                                                className={`card h-100 border-2 ${paymentMethod === 'cod' ? 'border-primary' : 'border-light'}`}
                                                                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                                                onClick={() => setPaymentMethod('cod')}
                                                            >
                                                                <div className="card-body p-3">
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="me-3">
                                                                            <i className="bi bi-cash-coin" style={{ fontSize: '24px', color: paymentMethod === 'cod' ? '#0d6efd' : '#6c757d' }}></i>
                                                                        </div>
                                                                        <div className="flex-grow-1">
                                                                            <h6 className="card-title mb-1" style={{ fontSize: '14px', fontWeight: 600 }}>Thanh toán khi nhận hàng</h6>
                                                                            <p className="card-text mb-0" style={{ fontSize: '12px', color: '#666' }}>COD - Cash on Delivery</p>
                                                                        </div>
                                                                        <input
                                                                            type="radio"
                                                                            name="payment"
                                                                            value="cod"
                                                                            checked={paymentMethod === 'cod'}
                                                                            onChange={() => setPaymentMethod('cod')}
                                                                            style={{ position: 'absolute', opacity: 0 }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <div 
                                                                className={`card h-100 border-2 ${paymentMethod === 'banking' ? 'border-primary' : 'border-light'}`}
                                                                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                                                onClick={() => setPaymentMethod('banking')}
                                                            >
                                                                <div className="card-body p-3">
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="me-3">
                                                                            <i className="bi bi-bank" style={{ fontSize: '24px', color: paymentMethod === 'banking' ? '#0d6efd' : '#6c757d' }}></i>
                                                                        </div>
                                                                        <div className="flex-grow-1">
                                                                            <h6 className="card-title mb-1" style={{ fontSize: '14px', fontWeight: 600 }}>Chuyển khoản ngân hàng</h6>
                                                                            <p className="card-text mb-0" style={{ fontSize: '12px', color: '#666' }}>Bank Transfer</p>
                                                                        </div>
                                                                        <input
                                                                            type="radio"
                                                                            name="payment"
                                                                            value="banking"
                                                                            checked={paymentMethod === 'banking'}
                                                                            onChange={() => setPaymentMethod('banking')}
                                                                            style={{ position: 'absolute', opacity: 0 }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <div 
                                                                className={`card h-100 border-2 ${paymentMethod === 'momo' ? 'border-primary' : 'border-light'}`}
                                                                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                                                onClick={() => setPaymentMethod('momo')}
                                                            >
                                                                <div className="card-body p-3">
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="me-3">
                                                                            <i className="bi bi-wallet2" style={{ fontSize: '24px', color: paymentMethod === 'momo' ? '#0d6efd' : '#6c757d' }}></i>
                                                                        </div>
                                                                        <div className="flex-grow-1">
                                                                            <h6 className="card-title mb-1" style={{ fontSize: '14px', fontWeight: 600 }}>Ví MoMo</h6>
                                                                            <p className="card-text mb-0" style={{ fontSize: '12px', color: '#666' }}>Mobile Money</p>
                                                                        </div>
                                                                        <input
                                                                            type="radio"
                                                                            name="payment"
                                                                            value="momo"
                                                                            checked={paymentMethod === 'momo'}
                                                                            onChange={() => setPaymentMethod('momo')}
                                                                            style={{ position: 'absolute', opacity: 0 }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <div 
                                                                className={`card h-100 border-2 ${paymentMethod === 'vnpay' ? 'border-primary' : 'border-light'}`}
                                                                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                                                onClick={() => setPaymentMethod('vnpay')}
                                                            >
                                                                <div className="card-body p-3">
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="me-3">
                                                                            <i className="bi bi-credit-card" style={{ fontSize: '24px', color: paymentMethod === 'vnpay' ? '#0d6efd' : '#6c757d' }}></i>
                                                                        </div>
                                                                        <div className="flex-grow-1">
                                                                            <h6 className="card-title mb-1" style={{ fontSize: '14px', fontWeight: 600 }}>VNPay</h6>
                                                                            <p className="card-text mb-0" style={{ fontSize: '12px', color: '#666' }}>Online Payment</p>
                                                                        </div>
                                                                        <input
                                                                            type="radio"
                                                                            name="payment"
                                                                            value="vnpay"
                                                                            checked={paymentMethod === 'vnpay'}
                                                                            onChange={() => setPaymentMethod('vnpay')}
                                                                            style={{ position: 'absolute', opacity: 0 }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Ghi chú */}
                                                <div className="mb-4">
                                                    <label className="form-label">Ghi chú đơn hàng</label>
                                                    <textarea
                                                        className="form-control"
                                                        name="note"
                                                        value={formData.note}
                                                        onChange={handleInputChange}
                                                        rows={3}
                                                        placeholder="Ghi chú về đơn hàng, hướng dẫn giao hàng..."
                                                    ></textarea>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin đơn hàng bên phải */}
                                <div className="col-lg-4">
                                    <div className="card shadow-sm border-0">
                                        <div className="card-body p-4" style={{ textAlign: 'left' }}>
                                            <h5 className="mb-4" style={{ fontWeight: 600 }}>THÔNG TIN ĐƠN HÀNG</h5>
                                            
                                            {/* Danh sách sản phẩm */}
                                            <div className="mb-4">
                                                {cartItems.map((item) => (
                                                    <div key={`${item.id}-${item.color}-${item.size}`} className="d-flex align-items-center mb-3 p-2 rounded" style={{ background: '#f8f9fa' }}>
                                                        <img 
                                                            src={item.image} 
                                                            alt={item.name} 
                                                            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4, marginRight: 12 }}
                                                        />
                                                        <div className="flex-grow-1">
                                                            <div style={{ fontWeight: 500, fontSize: '14px' }}>{item.name}</div>
                                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                                {item.color && `Màu: ${item.color}`} {item.size && `| Size: ${item.size}`}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                                SL: {item.quantity} x {item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                            </div>
                                                        </div>
                                                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#e53935' }}>
                                                            {(item.price * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Tổng tiền */}
                                            <div className="border-top pt-3">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span>Tạm tính</span>
                                                    <span>{cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span>Phí vận chuyển</span>
                                                    <span>{shipping.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span>Giảm giá</span>
                                                    <span className="text-success">-{discount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                                                </div>
                                                <hr />
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <span style={{ fontWeight: 600, fontSize: '18px' }}>Tổng cộng</span>
                                                    <span style={{ fontWeight: 700, fontSize: '22px', color: '#e53935' }}>{total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                                                </div>
                                                
                                                {/* Nút đặt hàng */}
                                                <button 
                                                    className="btn btn-primary w-100 mb-2" 
                                                    style={{ fontWeight: 600, fontSize: '16px', padding: '12px' }}
                                                    onClick={handleSubmit}
                                                    disabled={cartItems.length === 0}
                                                >
                                                    Đặt hàng ngay
                                                </button>
                                                
                                                <Link to="/cart" className="btn btn-link w-100">&larr; Quay lại giỏ hàng</Link>
                                                
                                                {/* Phương thức thanh toán được chấp nhận */}
                                                <div className="mt-4">
                                                    <span className="text-muted" style={{ fontSize: '12px' }}>Chấp nhận thanh toán</span>
                                                    <div className="d-flex gap-2 mt-2">
                                                        <i className="bi bi-credit-card-2-front" style={{ fontSize: '20px', color: '#666' }}></i>
                                                        <i className="bi bi-paypal" style={{ fontSize: '20px', color: '#666' }}></i>
                                                        <i className="bi bi-wallet2" style={{ fontSize: '20px', color: '#666' }}></i>
                                                        <i className="bi bi-apple" style={{ fontSize: '20px', color: '#666' }}></i>
                                                        <i className="bi bi-google" style={{ fontSize: '20px', color: '#666' }}></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Checkout;