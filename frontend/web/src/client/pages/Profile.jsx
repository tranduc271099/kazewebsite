import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Profile.css';
import { useUser } from '../context/UserContext';
import ProfileSidebar from '../components/ProfileSidebar';
import vietnamAddress from './Checkout/vietnamAddress.json';

const Profile = () => {
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        district: '',
        ward: '',
        image: '',
        imageFile: null,
        role: '',
        gender: '',
        dob: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [availableWards, setAvailableWards] = useState([]);

    useEffect(() => {
        fetchProfile();
    }, []);

    // Fallback: Load data from localStorage if API doesn't return correct data
    useEffect(() => {
        const userFromStorage = localStorage.getItem('user');
        if (userFromStorage && (!formData.phone || !formData.address || formData.address === ', , , ')) {
            try {
                const userData = JSON.parse(userFromStorage);
                console.log('Loading from localStorage as fallback:', userData);
                
                // Only update if current data is empty or invalid
                setFormData(prev => ({
                    ...prev,
                    phone: prev.phone || userData.phone || '',
                    address: (prev.address && prev.address !== ', , , ') ? prev.address : (userData.address || ''),
                    name: prev.name || userData.name || '',
                    email: prev.email || userData.email || '',
                    role: prev.role || userData.role || '',
                    gender: prev.gender || userData.gender || '',
                    dob: prev.dob || (userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '')
                }));
            } catch (error) {
                console.error('Error parsing user data from localStorage:', error);
            }
        }
    }, [formData.phone, formData.address]);

    // Xử lý thay đổi tỉnh/thành phố
    useEffect(() => {
        if (formData.city) {
            const selectedCity = vietnamAddress.find(city => city.Id === formData.city);
            if (selectedCity && selectedCity.Districts) {
                setAvailableDistricts(selectedCity.Districts);
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
    useEffect(() => {
        if (formData.district) {
            const selectedDistrict = availableDistricts.find(district => district.Id === formData.district);
            if (selectedDistrict && selectedDistrict.Wards) {
                setAvailableWards(selectedDistrict.Wards);
            } else {
                setAvailableWards([]);
            }
        } else {
            setAvailableWards([]);
        }
    }, [formData.district, availableDistricts]);

    // Parse địa chỉ từ string thành các thành phần
    const parseAddress = (addressString) => {
        console.log('Parsing address:', addressString); // Debug log
        if (!addressString || addressString.trim() === '' || addressString === ', , , ') {
            console.log('Address is empty or invalid, returning empty values');
            return { address: '', city: '', district: '', ward: '' };
        }
        
        const parts = addressString.split(', ').map(part => part.trim());
        console.log('Address parts:', parts); // Debug log
        
        // Kiểm tra nếu tất cả các phần đều rỗng
        if (parts.every(part => part === '')) {
            console.log('All address parts are empty, returning empty values');
            return { address: '', city: '', district: '', ward: '' };
        }
        
        if (parts.length < 4) {
            console.log('Address has less than 4 parts, returning full address as detail');
            return { address: addressString, city: '', district: '', ward: '' };
        }
        
        return {
            address: parts[0] || '',
            ward: parts[1] || '',
            district: parts[2] || '',
            city: parts[3] || ''
        };
    };

    // Tìm ID của tỉnh/thành phố, quận/huyện, phường/xã từ tên
    const findCityId = (cityName) => {
        if (!cityName) return '';
        const city = vietnamAddress.find(city => city.Name === cityName);
        console.log('Finding city ID for:', cityName, 'Result:', city?.Id || 'Not found'); // Debug log
        return city ? city.Id : '';
    };

    const findDistrictId = (districtName) => {
        if (!districtName) return '';
        
        // Tìm trong tất cả các tỉnh/thành phố
        for (const city of vietnamAddress) {
            if (city.Districts) {
                const district = city.Districts.find(district => district.Name === districtName);
                if (district) {
                    console.log('Found district ID for:', districtName, 'Result:', district.Id, 'in city:', city.Name);
                    return district.Id;
                }
            }
        }
        console.log('District not found for:', districtName);
        return '';
    };

    const findWardId = (wardName) => {
        if (!wardName) return '';
        
        // Tìm trong tất cả các tỉnh/thành phố
        for (const city of vietnamAddress) {
            if (city.Districts) {
                for (const district of city.Districts) {
                    if (district.Wards) {
                        const ward = district.Wards.find(ward => ward.Name === wardName);
                        if (ward) {
                            console.log('Found ward ID for:', wardName, 'Result:', ward.Id, 'in district:', district.Name);
                            return ward.Id;
                        }
                    }
                }
            }
        }
        console.log('Ward not found for:', wardName);
        return '';
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const res = await axios.get('http://localhost:5000/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('Profile data received:', res.data);
            
            // Parse địa chỉ
            const parsedAddress = parseAddress(res.data.address);
            
            // Fallback: Nếu địa chỉ từ API không hợp lệ, thử lấy từ localStorage
            let addressDetail = parsedAddress.address;
            if (!addressDetail || addressDetail === ', , , ') {
                const userFromStorage = localStorage.getItem('user');
                if (userFromStorage) {
                    try {
                        const userData = JSON.parse(userFromStorage);
                        addressDetail = userData.address || '';
                        console.log('Using address from localStorage:', addressDetail);
                    } catch (error) {
                        console.error('Error parsing user data from localStorage:', error);
                    }
                }
            }
            
            setFormData({
                name: res.data.name || '',
                email: res.data.email || '',
                phone: res.data.phone || '',
                address: addressDetail,
                city: findCityId(parsedAddress.city) || '',
                district: findDistrictId(parsedAddress.district) || '',
                ward: findWardId(parsedAddress.ward) || '',
                image: res.data.image || '',
                imageFile: null,
                role: res.data.role || '',
                gender: res.data.gender || '',
                dob: res.data.dob ? new Date(res.data.dob).toISOString().split('T')[0] : '',
            });
            
            console.log('Form data set:', {
                name: res.data.name || '',
                email: res.data.email || '',
                phone: res.data.phone || '',
                address: addressDetail,
                city: findCityId(parsedAddress.city) || '',
                district: findDistrictId(parsedAddress.district) || '',
                ward: findWardId(parsedAddress.ward) || '',
                role: res.data.role || '',
                gender: res.data.gender || '',
                dob: res.data.dob ? new Date(res.data.dob).toISOString().split('T')[0] : ''
            });
            
            localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Không thể tải thông tin cá nhân');
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = e => {
        const file = e.target.files[0];
        if (file) {
            setFormData(f => ({
                ...f,
                imageFile: file,
                image: URL.createObjectURL(file)
            }));
        }
    };

    let avatar = '';
    if (formData.image && formData.image.startsWith('blob:')) {
        avatar = formData.image;
    } else if (user?.image) {
        if (user.image.startsWith('http')) avatar = user.image;
        else if (user.image.startsWith('/uploads/')) avatar = `http://localhost:5000${user.image}`;
        else if (user.image.startsWith('/api/uploads/')) avatar = `http://localhost:5000${user.image.replace('/api', '')}`;
        else avatar = `http://localhost:5000/${user.image}`;
    } else {
        avatar = '/default-avatar.png';
    }

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('token');
            
            // Tạo địa chỉ đầy đủ
            const selectedCity = vietnamAddress.find(city => city.Id === formData.city);
            const selectedDistrict = availableDistricts.find(district => district.Id === formData.district);
            const selectedWard = availableWards.find(ward => ward.Id === formData.ward);
            
            const fullAddress = `${formData.address}, ${selectedWard?.Name || ''}, ${selectedDistrict?.Name || ''}, ${selectedCity?.Name || ''}`;
            
            const form = new FormData();
            form.append('name', formData.name);
            form.append('phone', formData.phone);
            form.append('address', fullAddress);
            form.append('gender', formData.gender);
            form.append('dob', formData.dob);
            if (formData.imageFile) {
                form.append('image', formData.imageFile);
            }
            
            await axios.put('http://localhost:5000/api/users/me', form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccess('Cập nhật thông tin thành công!');
            window.location.reload();
            localStorage.setItem('userName', formData.name);
            const res = await axios.get('http://localhost:5000/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            setFormData(f => ({ ...f, image: res.data.image || '' }));
        } catch (err) {
            setError('Cập nhật thất bại!');
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page" style={{ background: '#f5f5f7', minHeight: '100vh', padding: '40px 0', marginTop: 80 }}>
            <div className="container" style={{ display: 'flex', gap: 32, maxWidth: 1100, margin: '0 auto' }}>
                <ProfileSidebar activePage="profile" />
                {/* Main content */}
                <main className="profile-main" style={{
                    flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 36, minWidth: 0
                }}>
                    <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Hồ Sơ Của Tôi</h2>
                    <div style={{ color: '#888', marginBottom: 24 }}>Quản lý thông tin hồ sơ để bảo mật tài khoản</div>
                    
                    {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
                    {success && <div style={{ color: 'green', marginBottom: 16 }}>{success}</div>}
                    
                    <form style={{ maxWidth: 600 }} onSubmit={handleSubmit}>
                        {/* Avatar upload */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Ảnh đại diện</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#eee', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img
                                        src={avatar}
                                        alt="avatar"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: 14 }} />
                            </div>
                        </div>
                        {/* Name */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Tên</label>
                            <input type="text" value={formData.name} onChange={handleChange} name="name"
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }} required />
                        </div>
                        {/* Email */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Email</label>
                            <input type="email" value={formData.email} disabled
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #eee', background: '#f5f5f5' }} />
                        </div>
                        {/* Phone */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Số điện thoại</label>
                            <input type="tel" value={formData.phone} onChange={handleChange} name="phone"
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }} />
                        </div>
                        
                        {/* Địa chỉ chi tiết */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Địa chỉ chi tiết</label>
                            <input type="text" value={formData.address} onChange={handleChange} name="address"
                                placeholder="Số nhà, tên đường, phường/xã"
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }} />
                        </div>

                        {/* Tỉnh/Thành phố */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Tỉnh/Thành phố</label>
                            <select
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                            >
                                <option value="">Chọn tỉnh/thành phố</option>
                                {vietnamAddress.map((city) => (
                                    <option key={city.Id} value={city.Id}>
                                        {city.Name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Quận/Huyện */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Quận/Huyện</label>
                            <select
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                disabled={!formData.city}
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                            >
                                <option value="">Chọn quận/huyện</option>
                                {availableDistricts.map((district) => (
                                    <option key={district.Id} value={district.Id}>
                                        {district.Name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Phường/Xã */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Phường/Xã</label>
                            <select
                                name="ward"
                                value={formData.ward}
                                onChange={handleChange}
                                disabled={!formData.district}
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                            >
                                <option value="">Chọn phường/xã</option>
                                {availableWards.map((ward) => (
                                    <option key={ward.Id} value={ward.Id}>
                                        {ward.Name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Gender */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Giới tính</label>
                            <select
                                value={formData.gender}
                                onChange={handleChange}
                                name="gender"
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                        {/* Date of Birth */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Ngày sinh</label>
                            <input type="date" value={formData.dob} onChange={handleChange} name="dob"
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }} />
                        </div>
                        {/* Role (readonly) */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Vai trò</label>
                            <input type="text" value={formData.role || ''} disabled
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #eee', background: '#f5f5f5' }} />
                        </div>
                        {/* Nút lưu */}
                        <div style={{ marginLeft: 120 }}>
                            <button type="submit" style={{
                                background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 32px', fontWeight: 600, fontSize: 16
                            }}>{loading ? 'Đang lưu...' : 'Lưu'}</button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default Profile; 