import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';
import vietnamAddress from './Checkout/vietnamAddress.json';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        city: '',
        district: '',
        ward: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [availableWards, setAvailableWards] = useState([]);

    // Xử lý thay đổi tỉnh/thành phố
    React.useEffect(() => {
        if (formData.city) {
            const selectedCity = vietnamAddress.find(city => city.Id === formData.city);
            if (selectedCity && selectedCity.Districts) {
                setAvailableDistricts(selectedCity.Districts);
                setFormData(prev => ({ ...prev, district: '', ward: '' }));
            } else {
                setAvailableDistricts([]);
                setAvailableWards([]);
            }
        } else {
            setAvailableDistricts([]);
            setAvailableWards([]);
        }
    }, [formData.city]);

    // Xử lý thay đổi quận/huyện
    React.useEffect(() => {
        if (formData.district) {
            const selectedDistrict = availableDistricts.find(district => district.Id === formData.district);
            if (selectedDistrict && selectedDistrict.Wards) {
                setAvailableWards(selectedDistrict.Wards);
                setFormData(prev => ({ ...prev, ward: '' }));
            } else {
                setAvailableWards([]);
            }
        } else {
            setAvailableWards([]);
        }
    }, [formData.district, availableDistricts]);

    const validateForm = () => {
        const newErrors = {};

        // Validate tên
        if (!formData.name.trim()) {
            newErrors.name = 'Vui lòng nhập họ và tên';
        } else if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.name)) {
            newErrors.name = 'Tên không được chứa số và ký tự đặc biệt';
        } else if (formData.name.trim().split(/\s+/).length > 20) {
            newErrors.name = 'Tên không được quá 20 từ';
        }

        // Validate email
        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        // Validate mật khẩu
        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        } else if (formData.password.length > 20) {
            newErrors.password = 'Mật khẩu không được quá 20 ký tự';
        }

        // Validate số điện thoại
        if (!formData.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        } else if (!/^0\d{9}$/.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại không đúng';
        }

        // Validate địa chỉ
        if (!formData.address.trim()) {
            newErrors.address = 'Vui lòng nhập địa chỉ';
        }

        // Validate tỉnh/thành phố
        if (!formData.city) {
            newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
        }

        // Validate quận/huyện
        if (!formData.district) {
            newErrors.district = 'Vui lòng chọn quận/huyện';
        }

        // Validate phường/xã
        if (!formData.ward) {
            newErrors.ward = 'Vui lòng chọn phường/xã';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Tạo địa chỉ đầy đủ
            const selectedCity = vietnamAddress.find(city => city.Id === formData.city);
            const selectedDistrict = availableDistricts.find(district => district.Id === formData.district);
            const selectedWard = availableWards.find(ward => ward.Id === formData.ward);
            
            const fullAddress = `${formData.address}, ${selectedWard?.Name || formData.ward}, ${selectedDistrict?.Name || formData.district}, ${selectedCity?.Name || formData.city}`;
            
            const registerData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                address: fullAddress
            };

            const response = await axios.post('http://localhost:5000/api/users/register', registerData);
            navigate('/login');
        } catch (err) {
            setErrors({ submit: err.response?.data?.message || 'Đăng ký không thành công. Vui lòng thử lại.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-container">
                <div className="auth-card register-card">
                    <div className="auth-header">
                        <h2>Đăng ký tài khoản</h2>
                        <p>Điền thông tin để tạo tài khoản mới</p>
                    </div>

                    {errors.submit && <div className="auth-error">{errors.submit}</div>}

                    <form onSubmit={handleSubmit} className="auth-form register-form-grid">
                        <div className="form-row">
                            <div className="form-group form-col-2">
                                <label htmlFor="name">Họ và tên *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập họ và tên"
                                />
                                {errors.name && <div className="error-message">{errors.name}</div>}
                            </div>
                            <div className="form-group form-col-2">
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập email của bạn"
                                />
                                {errors.email && <div className="error-message">{errors.email}</div>}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group form-col-2">

                                <label htmlFor="password">Mật khẩu *</label>
                                <div className="password-input-container">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Tạo mật khẩu mới"
                                        style={{ color: '#222', backgroundColor: '#fafbfc' }}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                                {errors.password && <div className="error-message">{errors.password}</div>}
                            </div>
                            <div className="form-group form-col-2">
                                <label htmlFor="phone">Số điện thoại *</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required

                                    placeholder="Nhập số điện thoại "
                                    style={{ color: '#222', backgroundColor: '#fafbfc' }}
                                />
                                {errors.phone && <div className="error-message">{errors.phone}</div>}
                            </div>
                        </div>
                        
                        {/* Địa chỉ */}
                        <div className="form-row">
                            <div className="form-group form-col-1">
                                <label htmlFor="address">Địa chỉ chi tiết *</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    placeholder="Số nhà, tên đường, phường/xã"
                                    rows="3"
                                />
                                {errors.address && <div className="error-message">{errors.address}</div>}
                            </div>
                        </div>

                        {/* Tỉnh/Thành phố, Quận/Huyện, Phường/Xã */}
                        <div className="form-row">
                            <div className="form-group form-col-2">
                                <label htmlFor="city">Tỉnh/Thành phố *</label>
                                <select
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    style={{ color: '#222', backgroundColor: '#fafbfc' }}
                                >
                                    <option value="">Chọn tỉnh/thành phố</option>
                                    {vietnamAddress.map((city) => (
                                        <option key={city.Id} value={city.Id}>
                                            {city.Name}
                                        </option>
                                    ))}
                                </select>
                                {errors.city && <div className="error-message">{errors.city}</div>}
                            </div>
                            <div className="form-group form-col-2">
                                <label htmlFor="district">Quận/Huyện *</label>
                                <select
                                    id="district"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    required
                                    disabled={!formData.city}
                                    style={{ color: '#222', backgroundColor: '#fafbfc' }}
                                >
                                    <option value="">Chọn quận/huyện</option>
                                    {availableDistricts.map((district) => (
                                        <option key={district.Id} value={district.Id}>
                                            {district.Name}
                                        </option>
                                    ))}
                                </select>
                                {errors.district && <div className="error-message">{errors.district}</div>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group form-col-2">
                                <label htmlFor="ward">Phường/Xã *</label>
                                <select
                                    id="ward"
                                    name="ward"
                                    value={formData.ward}
                                    onChange={handleChange}
                                    required
                                    disabled={!formData.district}
                                    style={{ color: '#222', backgroundColor: '#fafbfc' }}
                                >
                                    <option value="">Chọn phường/xã</option>
                                    {availableWards.map((ward) => (
                                        <option key={ward.Id} value={ward.Id}>
                                            {ward.Name}
                                        </option>
                                    ))}
                                </select>
                                {errors.ward && <div className="error-message">{errors.ward}</div>}
                            </div>
                        </div>

                        <div className="auth-actions">
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                        </div>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register; 