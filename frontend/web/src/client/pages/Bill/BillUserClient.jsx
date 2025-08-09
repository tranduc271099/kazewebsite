import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';
import '../../styles/BillHistory.css';
import ProfileSidebar from '../../components/ProfileSidebar';

const BillUserClient = () => {
    // Review modal state
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewBillId, setReviewBillId] = useState(null);
    const [reviewData, setReviewData] = useState({}); // { [productId]: { rating, comment } }
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    // Show review modal for a bill
    const handleShowReviewModal = (bill) => {
        setReviewBillId(bill._id);
        // Initialize review data for each product
        const initial = {};
        bill.danh_sach_san_pham.forEach(item => {
            initial[item.san_pham_id?._id] = { rating: 5, comment: '' };
        });
        setReviewData(initial);
        setShowReviewModal(true);
    };

    const handleReviewChange = (productId, field, value) => {
        setReviewData(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value
            }
        }));
    };

    const handleSubmitReview = async () => {
        if (!reviewBillId) return;
        setReviewSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const reviews = Object.entries(reviewData).map(([productId, { rating, comment }]) => ({
                productId,
                rating,
                content: comment,
                orderId: reviewBillId
            }));
            // Call API to submit reviews for all products in the bill
            await Promise.all(reviews.map(async (r) => {
                try {
                    await axios.post('http://localhost:5000/api/comments', {
                        productId: r.productId,
                        rating: r.rating,
                        content: r.content,
                        orderId: r.orderId
                    }, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } catch (err) {
                    if (err.response && err.response.data && err.response.data.message === 'Bạn đã đánh giá sản phẩm này rồi') {
                        toast.error('Bạn đã đánh giá sản phẩm này rồi.');
                    } else {
                        toast.error('Có lỗi khi gửi đánh giá.');
                    }
                    throw err;
                }
            }));
            toast.success('Đánh giá thành công!');
            // Optionally, mark bill as reviewed in UI
            setBills(bills.map(bill => bill._id === reviewBillId ? { ...bill, reviewed: true } : bill));
            setShowReviewModal(false);
            setReviewBillId(null);
        } catch (err) {
            // Đã xử lý toast ở trên
        } finally {
            setReviewSubmitting(false);
        }
    };
    const navigate = useNavigate();
    const { user } = useUser();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedBill, setSelectedBill] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelingBillId, setCancelingBillId] = useState(null);
    const [sortType, setSortType] = useState('newest');
    const [dateFilter, setDateFilter] = useState('');
    // Return request state
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [returnImages, setReturnImages] = useState([]);
    const [bankInfo, setBankInfo] = useState({ bankName: '', accountNumber: '', accountName: '' });
    const [returnBillId, setReturnBillId] = useState(null);
    const [imagePreview, setImagePreview] = useState([]);
    const [imageUploading, setImageUploading] = useState(false);

    // Danh sách ngân hàng Việt Nam
    const bankList = [
        'Vietcombank - Ngân hàng TMCP Ngoại thương Việt Nam',
        'VietinBank - Ngân hàng TMCP Công thương Việt Nam',
        'BIDV - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
        'Agribank - Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam',
        'Techcombank - Ngân hàng TMCP Kỹ thương Việt Nam',
        'MBBank - Ngân hàng TMCP Quân đội',
        'ACB - Ngân hàng TMCP Á Châu',
        'VPBank - Ngân hàng TMCP Việt Nam Thịnh vượng',
        'TPBank - Ngân hàng TMCP Tiên Phong',
        'Sacombank - Ngân hàng TMCP Sài Gòn Thương tín',
        'HDBank - Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh',
        'SHB - Ngân hàng TMCP Sài Gòn - Hà Nội',
        'VIB - Ngân hàng TMCP Quốc tế Việt Nam',
        'MSB - Ngân hàng TMCP Hàng Hải',
        'OCB - Ngân hàng TMCP Phương Đông',
        'SeABank - Ngân hàng TMCP Đông Nam Á',
        'LienVietPostBank - Ngân hàng TMCP Bưu điện Liên Việt',
        'VietCapitalBank - Ngân hàng TMCP Bản Việt',
        'SCB - Ngân hàng TMCP Sài Gòn',
        'NCB - Ngân hàng TMCP Quốc Dân',
        'OceanBank - Ngân hàng Thương mại TNHH MTV Đại Dương',
        'GPBank - Ngân hàng TMCP Dầu khí Toàn Cầu',
        'VietABank - Ngân hàng TMCP Việt Á',
        'NamABank - Ngân hàng TMCP Nam Á',
        'PGBank - Ngân hàng TMCP Xăng dầu Petrolimex',
        'KienLongBank - Ngân hàng TMCP Kiên Long',
        'BacABank - Ngân hàng TMCP Bắc Á',
        'PVcomBank - Ngân hàng TMCP Đại Chúng Việt Nam',
        'Eximbank - Ngân hàng TMCP Xuất Nhập khẩu Việt Nam',
        'ABBANK - Ngân hàng TMCP An Bình'
    ];

    const statusTabs = [
        { key: 'all', name: 'Tất cả' },
        { key: 'chờ xác nhận', name: 'Chờ xác nhận' },
        { key: 'đã xác nhận', name: 'Đã xác nhận' },
        { key: 'đang giao hàng', name: 'Đang giao' },
        { key: 'đã giao hàng', name: 'Hoàn thành' },
        { key: 'yêu cầu trả hàng', name: 'Trả hàng' },
        { key: 'đã hoàn tiền', name: 'Đã hoàn tiền' },
        { key: 'đã hủy', name: 'Đã hủy' },
    ];

    // Avatar handling
    let avatar = '';
    if (user?.image) {
        if (user.image.startsWith('http')) avatar = user.image;
        else if (user.image.startsWith('/uploads/')) avatar = `http://localhost:5000${user.image}`;
        else if (user.image.startsWith('/api/uploads/')) avatar = `http://localhost:5000${user.image.replace('/api', '')}`;
        else avatar = `http://localhost:5000/${user.image}`;
    } else {
        avatar = '/default-avatar.png';
    }

    useEffect(() => {
        const fetchBills = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                const { data } = await axios.get('http://localhost:5000/api/bill', config);
                setBills(data);
            } catch (err) {
                setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại.');
                console.error(err);
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBills();
    }, [navigate]);

    const handleCancelOrder = (billId) => {
        setCancelingBillId(billId);
        setShowCancelModal(true);
    };

    const confirmCancelOrder = async () => {
        if (!cancelingBillId) return;
        if (!cancelReason.trim()) {
            toast.error('Vui lòng nhập lý do huỷ đơn!');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/bill/${cancelingBillId}/cancel`,
                { ly_do_huy: cancelReason },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (response.status === 200) {
                toast.success('Hủy đơn hàng thành công!');
                setBills(bills.map(bill => bill._id === cancelingBillId ? { ...bill, trang_thai: 'đã hủy', ly_do_huy: cancelReason } : bill));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.');
        } finally {
            setShowCancelModal(false);
            setCancelingBillId(null);
            setCancelReason('');
        }
    };

    const handleConfirmReceived = async (billId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/bill/${billId}/confirm-received`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (response.status === 200) {
                toast.success('Đã xác nhận nhận hàng!');
                setBills(bills.map(bill => bill._id === billId ? { ...bill, trang_thai: 'hoàn thành' } : bill));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi khi xác nhận nhận hàng.');
        }
    };

    // Xử lý tiếp tục thanh toán VNPay
    const handleContinuePayment = async (bill) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                navigate('/login');
                return;
            }

            toast.info('Đang tạo link thanh toán...', { autoClose: 3000 });

            // Đảm bảo orderId có giá trị hợp lệ
            const orderIdToUse = bill.orderId || bill._id || Date.now().toString();
            console.log('Continue payment - bill.orderId:', bill.orderId);
            console.log('Continue payment - bill._id:', bill._id);
            console.log('Continue payment - orderIdToUse:', orderIdToUse);

            // Gọi API tạo lại URL thanh toán VNPay với orderId hiện tại và timeout
            const vnpayRes = await axios.post("http://localhost:5000/api/payment/vnpay", {
                amount: (bill.tong_tien || 0) - (bill.discount || 0),
                orderInfo: `Tiep tuc thanh toan don hang ${bill.orderId || bill._id.slice(-8).toUpperCase()}`,
                orderType: "other",
                orderId: orderIdToUse // đảm bảo có giá trị
            }, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 15000 // 15 giây timeout
            });

            console.log('VNPay continue payment response:', vnpayRes.data);

            if (vnpayRes.data && vnpayRes.data.paymentUrl) {
                console.log('Redirecting to VNPay URL:', vnpayRes.data.paymentUrl);
                toast.success("Đang chuyển hướng đến VNPay...", { autoClose: 1000 });

                // Delay nhỏ trước khi redirect
                setTimeout(() => {
                    window.location.href = vnpayRes.data.paymentUrl;
                }, 500);
            } else {
                console.error('Invalid VNPay response:', vnpayRes.data);
                toast.error("Không tạo được link thanh toán VNPay");
            }
        } catch (err) {
            console.error("VNPay continue payment error:", err);

            if (err.code === 'ECONNABORTED') {
                toast.error("Kết nối VNPay quá chậm, vui lòng thử lại");
            } else if (err.response?.status === 404) {
                toast.error("Không tìm thấy API thanh toán VNPay");
            } else if (err.response?.status >= 500) {
                toast.error("Lỗi server VNPay, vui lòng thử lại sau");
            } else if (err.response?.status === 401) {
                toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                navigate('/login');
            } else {
                toast.error(`Lỗi VNPay: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    // Xử lý yêu cầu trả hàng
    const handleReturnRequest = (billId) => {
        setReturnBillId(billId);
        setReturnReason('');
        setReturnImages([]);
        setBankInfo({ bankName: '', accountNumber: '', accountName: '' });
        setImagePreview([]);
        setShowReturnModal(true);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImageUploading(true);

        const newImagePreviews = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setImagePreview([...imagePreview, ...newImagePreviews]);
        setImageUploading(false);
    };

    const uploadImages = async (files) => {
        const uploadPromises = files.map(async (file) => {
            const formData = new FormData();
            formData.append('image', file);

            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(
                    'http://localhost:5000/api/upload/image',
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                return response.data.url;
            } catch (error) {
                console.error('Error uploading image:', error);
                throw error;
            }
        });

        return Promise.all(uploadPromises);
    };

    const submitReturnRequest = async () => {
        // Validation
        if (!returnReason.trim()) {
            toast.error('Vui lòng nhập lý do trả hàng!');
            return;
        }

        if (!bankInfo.bankName || !bankInfo.accountNumber.trim() || !bankInfo.accountName.trim()) {
            toast.error('Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng!');
            return;
        }

        // Validate account number (chỉ cho phép số)
        if (!/^\d+$/.test(bankInfo.accountNumber.trim())) {
            toast.error('Số tài khoản chỉ được chứa số!');
            return;
        }

        try {
            setImageUploading(true);
            let imageUrls = [];

            // Upload images if any
            if (imagePreview.length > 0) {
                try {
                    const files = imagePreview.map(item => item.file);
                    imageUrls = await uploadImages(files);
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    toast.error('Có lỗi khi tải lên hình ảnh. Vui lòng thử lại!');
                    return;
                }
            }

            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                return;
            }

            const response = await axios.post(
                `http://localhost:5000/api/bill/${returnBillId}/return-request`,
                {
                    reason: returnReason.trim(),
                    images: imageUrls,
                    bankInfo: {
                        bankName: bankInfo.bankName,
                        accountNumber: bankInfo.accountNumber.trim(),
                        accountName: bankInfo.accountName.trim()
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                toast.success('Đã gửi yêu cầu trả hàng thành công!');

                // Update bills state
                setBills(bills.map(bill =>
                    bill._id === returnBillId
                        ? {
                            ...bill,
                            trang_thai: 'yêu cầu trả hàng',
                            returnRequest: {
                                reason: returnReason.trim(),
                                images: imageUrls,
                                bankInfo: {
                                    bankName: bankInfo.bankName,
                                    accountNumber: bankInfo.accountNumber.trim(),
                                    accountName: bankInfo.accountName.trim()
                                },
                                requestDate: new Date(),
                                status: 'pending'
                            }
                        }
                        : bill
                ));

                // Reset form and close modal
                setReturnReason('');
                setBankInfo({ bankName: '', accountNumber: '', accountName: '' });
                setImagePreview([]);
                setReturnImages([]);
                setReturnBillId(null);
                setShowReturnModal(false);
            }
        } catch (error) {
            console.error('Submit return request error:', error);

            if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
            } else if (error.response?.status === 404) {
                toast.error('Không tìm thấy đơn hàng!');
            } else if (error.response?.status === 400) {
                toast.error(error.response?.data?.message || 'Dữ liệu không hợp lệ!');
            } else {
                toast.error(error.response?.data?.message || 'Có lỗi khi gửi yêu cầu trả hàng. Vui lòng thử lại!');
            }
        } finally {
            setImageUploading(false);
        }
    };

    const showBillDetail = (bill) => {
        setSelectedBill(bill);
        setShowDetailModal(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'chờ xác nhận': return '#f59e0b';
            case 'đã xác nhận': return '#3b82f6';
            case 'đang giao hàng': return '#8b5cf6';
            case 'đã giao hàng': return '#10b981';
            case 'hoàn thành': return '#16a34a';
            case 'đã nhận hàng': return '#16a34a';
            case 'yêu cầu trả hàng': return '#9333ea';
            case 'đang xử lý trả hàng': return '#9333ea';
            case 'đã hoàn tiền': return '#0284c7';
            case 'đã hủy': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusDisplay = (status) => {
        const statusMap = {
            'chờ xác nhận': 'CHỜ XÁC NHẬN',
            'đã xác nhận': 'CHỜ LẤY HÀNG',
            'đang giao hàng': 'ĐANG VẬN CHUYỂN',
            'đã giao hàng': 'GIAO HÀNG THÀNH CÔNG',
            'hoàn thành': 'ĐÃ HOÀN THÀNH',
            'đã nhận hàng': 'ĐÃ NHẬN HÀNG',
            'yêu cầu trả hàng': 'YÊU CẦU TRẢ HÀNG',
            'đang xử lý trả hàng': 'ĐANG XỬ LÝ TRẢ HÀNG',
            'đã hoàn tiền': 'ĐÃ HOÀN TIỀN',
            'đã hủy': 'ĐƠN HÀNG ĐÃ HỦY',
        };
        return statusMap[status] || status.toUpperCase();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const parseAddress = (address) => {
        if (!address) return { street: '', ward: '', district: '', city: '' };

        const parts = address.split(',').map(part => part.trim());
        if (parts.length >= 4) {
            return {
                street: parts[0],
                ward: parts[1],
                district: parts[2],
                city: parts[3]
            };
        }
        return { street: address, ward: '', district: '', city: '' };
    };

    const filteredBills = bills.filter(bill => {
        const matchStatus = selectedStatus === 'all' || bill.trang_thai === selectedStatus;
        let matchDate = true;
        if (dateFilter) {
            const billDate = new Date(bill.ngay_tao);
            const filterDate = new Date(dateFilter);
            matchDate = billDate.toISOString().slice(0, 10) === filterDate.toISOString().slice(0, 10);
        }
        return matchStatus && matchDate;
    });

    const sortedBills = [...filteredBills].sort((a, b) => {
        if (sortType === 'newest') {
            return new Date(b.ngay_tao).getTime() - new Date(a.ngay_tao).getTime();
        } else if (sortType === 'oldest') {
            return new Date(a.ngay_tao).getTime() - new Date(b.ngay_tao).getTime();
        } else if (sortType === 'highest') {
            return (b.tong_tien || 0) - (a.tong_tien || 0);
        } else if (sortType === 'lowest') {
            return (a.tong_tien || 0) - (b.tong_tien || 0);
        }
        return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBills = sortedBills.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedBills.length / itemsPerPage);

    // Xác định đơn hàng mới nhất thực sự (theo ngày tạo lớn nhất trong toàn bộ bills)
    const trulyNewestBill = bills.length > 0 ? bills.reduce((latest, bill) => new Date(bill.ngay_tao) > new Date(latest.ngay_tao) ? bill : latest, bills[0]) : null;
    const trulyNewestBillId = trulyNewestBill?._id;

    const isNewOrder = (dateString) => {
        const orderDate = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
        return diffInHours < 24;
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="bill-history-page" style={{ background: '#f5f5f7', minHeight: '100vh', padding: '40px 0', marginTop: 80 }}>
            <div className="bill-container" style={{ display: 'flex', gap: 32, maxWidth: 1100, margin: '0 auto' }}>
                <ProfileSidebar activePage="bill" />

                <main className="bill-main">
                    <div className="status-tabs-container">
                        {statusTabs.map(tab => (
                            <div
                                key={tab.key}
                                className={`status-tab ${selectedStatus === tab.key ? 'active' : ''}`}
                                onClick={() => { setSelectedStatus(tab.key); setCurrentPage(1); }}
                            >
                                {tab.name}
                            </div>
                        ))}
                    </div>

                    {loading ? <div className="loading-state">Đang tải...</div> :
                        error ? <div className="error-state">{error}</div> :
                            currentBills.length === 0 ? (
                                <div className="bill-empty-state">
                                    <div className="bill-empty-state-icon">
                                        <i className="bi bi-receipt"></i>
                                    </div>
                                    <div className="bill-empty-state-title">Chưa có đơn hàng nào</div>
                                </div>
                            ) : (
                                <div className="order-list">
                                    {currentBills.map(bill => (
                                        <div key={bill._id} className="shopee-order-card">
                                            <div className="order-header">
                                                <span style={{ color: '#000' }}>Mã đơn hàng: {(bill.orderId || bill._id.slice(-8).toUpperCase())}</span>
                                                <span className="order-status" style={{ color: '#000' }}>{getStatusDisplay(bill.trang_thai)}</span>
                                            </div>

                                            {bill.danh_sach_san_pham.map(item => (
                                                <div key={item._id} className="product-item">
                                                    <img
                                                        src={item.san_pham_id?.images?.[0] || 'https://via.placeholder.com/150'}
                                                        alt={item.san_pham_id?.name || 'Sản phẩm'}
                                                        className="product-image"
                                                    />
                                                    <div className="product-details">
                                                        <p className="product-name" style={{ color: '#000' }}>{item.san_pham_id?.name || 'Sản phẩm không tồn tại'}</p>
                                                        <p className="product-variation">Phân loại: {item.mau_sac}, {item.kich_thuoc}</p>
                                                        <p className="product-quantity">x{item.so_luong}</p>
                                                    </div>
                                                    <span className="product-price">{formatPrice(item.gia)}</span>
                                                </div>
                                            ))}

                                            <div className="order-footer">
                                                <div className="total-amount">
                                                    <span>Thành tiền:</span>
                                                    <span className="amount">{formatPrice((bill.tong_tien || 0) - (bill.discount || 0))}</span>
                                                </div>
                                                <div className="order-actions">
                                                    <button className="shopee-btn shopee-btn-secondary" onClick={() => showBillDetail(bill)}>Xem Chi Tiết</button>
                                                    {(bill.trang_thai === 'chờ xác nhận' || bill.trang_thai === 'đã xác nhận') && (
                                                        <button className="shopee-btn shopee-btn-primary" onClick={() => handleCancelOrder(bill._id)}>Hủy Đơn</button>
                                                    )}
                                                    {/* Nút tiếp tục thanh toán chỉ cho VNPay chưa thanh toán và chưa bị hủy */}
                                                    {(bill.thanh_toan === 'chưa thanh toán' &&
                                                        (bill.phuong_thuc_thanh_toan === 'vnpay' || bill.phuong_thuc_thanh_toan === 'VNPAY') &&
                                                        bill.trang_thai !== 'đã hủy') && (
                                                            <button className="shopee-btn shopee-btn-success" onClick={() => handleContinuePayment(bill)}>
                                                                Tiếp Tục Thanh Toán
                                                            </button>
                                                        )}
                                                    {bill.trang_thai === 'đã giao hàng' && (
                                                        <>
                                                            <button className="shopee-btn shopee-btn-primary" onClick={() => handleConfirmReceived(bill._id)}>Đã Nhận Hàng</button>
                                                            <button className="shopee-btn shopee-btn-danger" onClick={() => handleReturnRequest(bill._id)}>Yêu Cầu Trả Hàng</button>
                                                        </>
                                                    )}
                                                    {/* Show review button if order is completed and not reviewed */}
                                                    {bill.trang_thai === 'hoàn thành' && !bill.reviewed && (
                                                        <button className="shopee-btn shopee-btn-warning" onClick={() => handleShowReviewModal(bill)}>
                                                            Đánh giá
                                                        </button>
                                                    )}
                                                    {bill.trang_thai === 'hoàn thành' && bill.reviewed && (
                                                        <span style={{ color: '#10b981', fontWeight: 600, marginLeft: 8 }}>Đã đánh giá</span>
                                                    )}
                                                </div>
                                            </div>
            {/* Review Modal */}
            {showReviewModal && reviewBillId && (
                <div className="review-modal" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="review-modal-content" style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 400, maxWidth: 500, boxShadow: '0 2px 16px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ marginBottom: 16 }}>Đánh giá sản phẩm</h3>
                        {bills.find(b => b._id === reviewBillId)?.danh_sach_san_pham.map(item => (
                            <div key={item.san_pham_id?._id} style={{ marginBottom: 24, borderBottom: '1px solid #eee', paddingBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <img src={item.san_pham_id?.images?.[0] || 'https://via.placeholder.com/60'} alt={item.san_pham_id?.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{item.san_pham_id?.name}</div>
                                        <div style={{ fontSize: 13, color: '#666' }}>Phân loại: {item.kich_thuoc} - {item.mau_sac}</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <span>Đánh giá: </span>
                                    {[1,2,3,4,5].map(star => (
                                        <span key={star} style={{ cursor: 'pointer', color: (reviewData[item.san_pham_id?._id]?.rating || 5) >= star ? '#ffc107' : '#ccc', fontSize: 20 }}
                                            onClick={() => handleReviewChange(item.san_pham_id?._id, 'rating', star)}>&#9733;</span>
                                    ))}
                                </div>
                                <textarea
                                    style={{ width: '100%', marginTop: 8, borderRadius: 4, border: '1px solid #ddd', padding: 8, fontSize: 14 }}
                                    rows={3}
                                    placeholder="Nhận xét của bạn về sản phẩm này..."
                                    value={reviewData[item.san_pham_id?._id]?.comment || ''}
                                    onChange={e => handleReviewChange(item.san_pham_id?._id, 'comment', e.target.value)}
                                />
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button className="shopee-btn shopee-btn-secondary" onClick={() => setShowReviewModal(false)} disabled={reviewSubmitting}>Hủy</button>
                            <button className="shopee-btn shopee-btn-primary" onClick={handleSubmitReview} disabled={reviewSubmitting}>
                                {reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                    {/* Pagination here if needed */}
                </main>
            </div>

            {showDetailModal && selectedBill && (
                <div className="bill-detail-modal" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content order-detail-modern" onClick={e => e.stopPropagation()} style={{ maxWidth: 1050, minWidth: 800 }}>
                        {/* Header */}
                        <div className="order-detail-header">
                            <span style={{ fontSize: '18px', fontWeight: '700', color: '#000' }}>Chi tiết đơn hàng <b style={{ color: '#000', fontWeight: '800' }}>#{selectedBill.orderId || selectedBill._id.slice(-8).toUpperCase()}</b></span>
                            <span style={{ fontSize: '1rem', color: '#555', fontWeight: 500, marginLeft: 'auto', marginRight: 24 }}>
                                Ngày đặt hàng: {formatDate(selectedBill.ngay_tao)}
                            </span>
                            <button className="close-btn" onClick={() => setShowDetailModal(false)}>&times;</button>
                        </div>
                        <div className="order-detail-body">
                            {/* Bên trái: Sản phẩm và tổng */}
                            <div className="order-detail-left order-detail-left-border">
                                {/* Danh sách sản phẩm */}
                                {selectedBill.danh_sach_san_pham.map((item, idx) => (
                                    <div className="order-detail-product-row order-detail-product-row-large" key={item.san_pham_id?._id + idx || idx}>
                                        <img className="order-detail-product-img" src={item.san_pham_id?.images?.[0] || 'https://via.placeholder.com/80'} alt={item.san_pham_id?.name || 'Sản phẩm'} />
                                        <div className="order-detail-product-info">
                                            <div className="order-detail-product-name" style={{ color: '#000', fontWeight: '600', fontSize: '16px' }}>{item.san_pham_id?.name || 'Sản phẩm không tồn tại'}</div>
                                            <div className="order-detail-product-variant" style={{ color: '#333', fontSize: '14px', fontWeight: '500' }}>
                                                Phân loại: {item.kich_thuoc} - {item.mau_sac} &nbsp;|&nbsp; SL: {item.so_luong}
                                            </div>
                                            <div className="order-detail-product-variant-price" style={{ fontSize: 14, color: '#2563eb', marginTop: 2, fontWeight: '600' }}>
                                                Giá biến thể: {formatPrice(item.gia)}
                                            </div>
                                            <div className="order-detail-product-variant-total" style={{ fontSize: 13, color: '#333', marginTop: 2, fontWeight: '600' }}>
                                                Tổng: {formatPrice(item.gia * item.so_luong)}
                                            </div>
                                        </div>
                                        <div className="order-detail-product-price">{formatPrice(item.gia)}</div>
                                    </div>
                                ))}
                                <hr className="order-detail-hr order-detail-hr-bold" />
                                {/* Bảng tạm tính, phí ship, tổng cộng */}
                                <div className="order-detail-summary-row" style={{ marginTop: 24, color: '#333', fontWeight: '500' }}>
                                    <span>Tạm tính</span>
                                    <span>{formatPrice(selectedBill.danh_sach_san_pham.reduce((sum, item) => sum + (item.gia * item.so_luong), 0))}</span>
                                </div>
                                <div className="order-detail-summary-row" style={{ color: '#333', fontWeight: '500' }}>
                                    <span>Phí vận chuyển</span>
                                    <span>{formatPrice(selectedBill.shippingFee || 0)}</span>
                                </div>
                                <div className="order-detail-summary-row" style={{ color: '#333', fontWeight: '500' }}>
                                    <span>Giảm giá</span>
                                    <span style={{ color: '#10b981', fontWeight: '600' }}>-{formatPrice(selectedBill.discount || 0)}</span>
                                </div>
                                <div className="order-detail-summary-row order-detail-summary-total" style={{ color: '#000', fontWeight: '700' }}>
                                    <span>Tổng cộng</span>
                                    <span>{formatPrice((selectedBill.tong_tien || 0) - (selectedBill.discount || 0))}</span>
                                </div>
                            </div>
                            {/* Bên phải: Box thông tin trạng thái, giao hàng, thanh toán */}
                            <div className="order-detail-right-box">
                                <div className="order-detail-status">TRẠNG THÁI ĐƠN HÀNG<br /><span style={{ color: '#000' }}>{getStatusDisplay(selectedBill.trang_thai)}</span></div>
                                <div className="order-detail-section">
                                    <div className="order-detail-section-title">THÔNG TIN GIAO HÀNG</div>
                                    <div><b style={{ color: '#000' }}>Tên người đặt:</b> <span style={{ color: '#000' }}>{selectedBill.nguoi_dung_id?.name || '---'}</span></div>
                                    <div><b style={{ color: '#000' }}>Số điện thoại:</b> <span style={{ color: '#000' }}>{selectedBill.nguoi_dung_id?.phone || '---'}</span></div>
                                    <div><b style={{ color: '#000' }}>Địa chỉ:</b> <span style={{ color: '#000' }}>{selectedBill.dia_chi_giao_hang || '---'}</span></div>
                                    {selectedBill.ghi_chu && (
                                        <div style={{ marginTop: 6 }}><b>Ghi chú:</b> {selectedBill.ghi_chu}</div>
                                    )}
                                    {selectedBill.trang_thai === 'đã hủy' && (
                                        <>
                                            <div style={{ marginTop: 6, color: '#ef4444' }}><b>Lý do hủy:</b> {selectedBill.ly_do_huy || 'Không có lý do'}</div>
                                            <div><b>Người hủy:</b> {selectedBill.nguoi_huy?.id?.name || 'Không rõ'}{selectedBill.nguoi_huy?.loai ? ` (${selectedBill.nguoi_huy.loai})` : ''}</div>
                                        </>
                                    )}
                                </div>
                                <div className="order-detail-section">
                                    <div className="order-detail-section-title" style={{ color: '#000' }}>THANH TOÁN</div>
                                    <div style={{ color: '#000' }}>Phương thức: {selectedBill.phuong_thuc_thanh_toan || '---'}</div>
                                    <div style={{ color: '#000' }}>Trạng thái thanh toán: <span style={{ color: selectedBill.thanh_toan === 'đã thanh toán' ? '#10b981' : selectedBill.thanh_toan === 'chưa thanh toán' ? '#f59e0b' : '#000', fontWeight: 600 }}>{selectedBill.thanh_toan || '---'}</span></div>
                                    <div style={{ color: '#000' }}>Trạng thái đơn hàng: <span style={{ color: selectedBill.trang_thai === 'đã hoàn thành' || selectedBill.trang_thai === 'hoàn thành' ? '#10b981' : selectedBill.trang_thai === 'đã hủy' ? '#ef4444' : selectedBill.trang_thai === 'chờ xác nhận' ? '#2563eb' : '#000' }}>{getStatusDisplay(selectedBill.trang_thai)}</span></div>
                                </div>

                                {(selectedBill.trang_thai === 'yêu cầu trả hàng' || selectedBill.trang_thai === 'đang xử lý trả hàng' || selectedBill.trang_thai === 'đã hoàn tiền') && (
                                    <div className="order-detail-section">
                                        <div className="order-detail-section-title" style={{ color: '#000', marginBottom: 8 }}>THÔNG TIN TRẢ HÀNG</div>

                                        {/* Trạng thái và ngày yêu cầu */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: 6,
                                            padding: '4px 8px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '4px',
                                            fontSize: '13px'
                                        }}>
                                            <span style={{ color: '#666' }}>Trạng thái:</span>
                                            <span style={{
                                                color: selectedBill.returnRequest?.status === 'pending' ? '#f59e0b' :
                                                    selectedBill.returnRequest?.status === 'processing' ? '#3b82f6' :
                                                        selectedBill.returnRequest?.status === 'approved' ? '#10b981' :
                                                            selectedBill.returnRequest?.status === 'rejected' ? '#ef4444' : '#000',
                                                fontWeight: '600'
                                            }}>
                                                {selectedBill.returnRequest?.status === 'pending' ? 'Chờ xử lý' :
                                                    selectedBill.returnRequest?.status === 'processing' ? 'Đang xử lý' :
                                                        selectedBill.returnRequest?.status === 'approved' ? 'Đã chấp nhận' :
                                                            selectedBill.returnRequest?.status === 'rejected' ? 'Đã từ chối' : '---'}
                                            </span>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: 8,
                                            fontSize: '13px',
                                            color: '#666'
                                        }}>
                                            <span>Ngày yêu cầu:</span>
                                            <span style={{ color: '#000' }}>
                                                {selectedBill.returnRequest?.requestDate ? formatDate(selectedBill.returnRequest.requestDate) : '---'}
                                            </span>
                                        </div>

                                        {/* Lý do trả hàng - rút gọn */}
                                        <div style={{ marginBottom: 8 }}>
                                            <div style={{ fontSize: '13px', color: '#666', marginBottom: 2 }}>Lý do:</div>
                                            <div style={{
                                                fontSize: '13px',
                                                color: '#000',
                                                backgroundColor: '#f8f9fa',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                maxHeight: '40px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical'
                                            }}>
                                                {selectedBill.returnRequest?.reason || '---'}
                                            </div>
                                        </div>

                                        {/* Thông tin ngân hàng - gọn hơn */}
                                        {selectedBill.returnRequest?.bankInfo && (
                                            <div style={{ marginBottom: 8 }}>
                                                <div style={{ fontSize: '13px', color: '#666', marginBottom: 4 }}>Thông tin hoàn tiền:</div>
                                                <div style={{
                                                    backgroundColor: '#f8f9fa',
                                                    padding: '6px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px'
                                                }}>
                                                    <div style={{ color: '#000', marginBottom: 2 }}>
                                                        <b>{selectedBill.returnRequest.bankInfo.bankName.split(' - ')[0]}</b>
                                                    </div>
                                                    <div style={{ color: '#666', marginBottom: 1 }}>
                                                        STK: {selectedBill.returnRequest.bankInfo.accountNumber}
                                                    </div>
                                                    <div style={{ color: '#666' }}>
                                                        CTK: {selectedBill.returnRequest.bankInfo.accountName}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Ghi chú admin */}
                                        {selectedBill.returnRequest?.adminNotes && (
                                            <div style={{ marginBottom: 8 }}>
                                                <div style={{ fontSize: '13px', color: '#666', marginBottom: 2 }}>Ghi chú admin:</div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: '#000',
                                                    backgroundColor: '#fff3cd',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ffeaa7'
                                                }}>
                                                    {selectedBill.returnRequest.adminNotes}
                                                </div>
                                            </div>
                                        )}

                                        {/* Hình ảnh - thu gọn */}
                                        {selectedBill.returnRequest?.images && selectedBill.returnRequest.images.length > 0 && (
                                            <div>
                                                <div style={{ fontSize: '13px', color: '#666', marginBottom: 4 }}>
                                                    Hình ảnh ({selectedBill.returnRequest.images.length}):
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                    {selectedBill.returnRequest.images.slice(0, 3).map((img, idx) => (
                                                        <a href={img} target="_blank" rel="noopener noreferrer" key={idx}>
                                                            <img
                                                                src={img}
                                                                alt={`Return image ${idx}`}
                                                                style={{
                                                                    width: 50,
                                                                    height: 50,
                                                                    objectFit: 'cover',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #ddd'
                                                                }}
                                                            />
                                                        </a>
                                                    ))}
                                                    {selectedBill.returnRequest.images.length > 3 && (
                                                        <div style={{
                                                            width: 50,
                                                            height: 50,
                                                            backgroundColor: '#f8f9fa',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '11px',
                                                            color: '#666'
                                                        }}>
                                                            +{selectedBill.returnRequest.images.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCancelModal && (
                <div className="cancel-modal">
                    <div className="cancel-modal-content">
                        <h4 style={{ fontWeight: 600, marginBottom: 15 }}>Lý do hủy đơn hàng</h4>
                        <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Nhập lý do..." rows={4} />
                        <div className="cancel-modal-actions">
                            <button className="shopee-btn shopee-btn-secondary" onClick={() => setShowCancelModal(false)}>Đóng</button>
                            <button className="shopee-btn shopee-btn-primary" onClick={confirmCancelOrder}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}

            {showReturnModal && (
                <div className="cancel-modal">
                    <div className="cancel-modal-content" style={{ maxWidth: 500, width: '100%' }}>
                        <h4 style={{ fontWeight: 600, marginBottom: 15 }}>Yêu cầu trả hàng hoàn tiền</h4>
                        <div className="form-group" style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Lý do trả hàng *</label>
                            <textarea
                                value={returnReason}
                                onChange={e => setReturnReason(e.target.value)}
                                placeholder="Vui lòng mô tả lý do trả hàng..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: 8,
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Thông tin hoàn tiền *</label>
                            <div style={{ marginBottom: 10 }}>
                                <label style={{ display: 'block', marginBottom: 3, fontSize: 14 }}>Tên ngân hàng</label>
                                <select
                                    value={bankInfo.bankName}
                                    onChange={e => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: 8,
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    required
                                >
                                    <option value="">-- Chọn ngân hàng --</option>
                                    {bankList.map((bank, index) => (
                                        <option key={index} value={bank}>
                                            {bank}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: 10 }}>
                                <label style={{ display: 'block', marginBottom: 3, fontSize: 14 }}>Số tài khoản</label>
                                <input
                                    type="text"
                                    value={bankInfo.accountNumber}
                                    onChange={e => {
                                        // Chỉ cho phép nhập số
                                        const value = e.target.value.replace(/\D/g, '');
                                        setBankInfo({ ...bankInfo, accountNumber: value });
                                    }}
                                    placeholder="Nhập số tài khoản..."
                                    style={{
                                        width: '100%',
                                        padding: 8,
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    maxLength="20"
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 3, fontSize: 14 }}>Tên chủ tài khoản</label>
                                <input
                                    type="text"
                                    value={bankInfo.accountName}
                                    onChange={e => setBankInfo({ ...bankInfo, accountName: e.target.value })}
                                    placeholder="Nhập tên chủ tài khoản..."
                                    style={{
                                        width: '100%',
                                        padding: 8,
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Hình ảnh sản phẩm (không bắt buộc)</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                style={{ marginBottom: 10 }}
                            />

                            {imagePreview.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {imagePreview.map((img, idx) => (
                                        <div key={idx} style={{ position: 'relative' }}>
                                            <img
                                                src={img.preview}
                                                alt={`Preview ${idx}`}
                                                style={{ width: 80, height: 80, objectFit: 'cover' }}
                                            />
                                            <button
                                                onClick={() => {
                                                    const newPreview = [...imagePreview];
                                                    newPreview.splice(idx, 1);
                                                    setImagePreview(newPreview);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    background: 'rgba(255,0,0,0.7)',
                                                    color: 'white',
                                                    border: 'none',
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    fontSize: 12
                                                }}
                                            >×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="cancel-modal-actions">
                            <button
                                className="shopee-btn shopee-btn-secondary"
                                onClick={() => setShowReturnModal(false)}
                                disabled={imageUploading}
                            >
                                Đóng
                            </button>
                            <button
                                className="shopee-btn shopee-btn-primary"
                                onClick={submitReturnRequest}
                                disabled={imageUploading}
                            >
                                {imageUploading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillUserClient;