import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Swal from 'sweetalert2';
import { BiSearch } from 'react-icons/bi';
import { AiOutlineEye, AiOutlineEdit } from 'react-icons/ai';
import { AiOutlinePlus } from 'react-icons/ai';
// @ts-ignore
import styles from '../styles/ProductLayout.module.css';

function Vouchers() {
    // State
    const [vouchers, setVouchers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [sortType, setSortType] = useState("newest");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentVoucherId, setCurrentVoucherId] = useState(null);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        discountType: "percent",
        discountValue: "",
        maxDiscount: "",
        minOrder: "",
        quantity: "",
        startDate: "",
        endDate: "",
        isActive: true,
    });
    const [appliedOrders, setAppliedOrders] = useState([]);
    const [selectedVoucherCode, setSelectedVoucherCode] = useState("");

    // Submit handler for add/edit voucher
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        // Validate required fields
        if (!formData.name || !formData.discountType || !formData.discountValue || !formData.quantity || !formData.startDate || !formData.endDate) {
            setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
            return;
        }
        // Nếu code rỗng thì tự sinh mã random
        let code = formData.code;
        if (!code) {
            code = Math.random().toString(36).substring(2, 8).toUpperCase();
        }
        if (Number(formData.discountValue) < 0) {
            setError("Giá trị giảm giá không được âm.");
            return;
        }
        if (formData.discountType === "percent" && Number(formData.discountValue) > 100) {
            setError("Phần trăm giảm giá không được vượt quá 100%.");
            return;
        }
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            setError("Ngày bắt đầu phải trước ngày kết thúc.");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const payload = {
                ...formData,
                code,
                discountValue: Number(formData.discountValue),
                maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
                minOrder: formData.minOrder ? Number(formData.minOrder) : undefined,
                quantity: Number(formData.quantity),
            };
            if (isEditing && currentVoucherId) {
                await axios.put(`http://localhost:5000/api/vouchers/${currentVoucherId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post("http://localhost:5000/api/vouchers", payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            fetchVouchers();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || "Không thể lưu voucher.");
        }
        setLoading(false);
    };

    // Fetch vouchers
    const fetchVouchers = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/vouchers", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setVouchers(res.data);
        } catch (err) {
            setError("Không thể tải danh sách voucher.");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    // Fetch applied orders for a voucher code
    const fetchAppliedOrders = async (code) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:5000/api/bill/applied-voucher/${code}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return Array.isArray(res.data) ? res.data : [];
        } catch {
            return [];
        }
    };

    // Modal handlers
    const handleOpenAddModal = () => {
        setFormData({
            code: "",
            name: "",
            description: "",
            discountType: "percent",
            discountValue: "",
            maxDiscount: "",
            minOrder: "",
            quantity: "",
            startDate: "",
            endDate: "",
            isActive: true,
        });
        setIsEditing(false);
        setIsModalOpen(true);
        setSelectedVoucherCode("");
        setAppliedOrders([]);
    };

    const handleOpenEditModal = (voucher) => {
        setFormData({
            code: voucher.code || "",
            name: voucher.name || "",
            description: voucher.description || "",
            discountType: voucher.discountType || "percent",
            discountValue: voucher.discountValue || "",
            maxDiscount: voucher.maxDiscount || "",
            minOrder: voucher.minOrder || "",
            quantity: voucher.quantity || "",
            startDate: voucher.startDate ? voucher.startDate.slice(0, 10) : "",
            endDate: voucher.endDate ? voucher.endDate.slice(0, 10) : "",
            isActive: voucher.isActive !== undefined ? voucher.isActive : true,
        });
        setIsEditing(true);
        setIsModalOpen(true);
        setCurrentVoucherId(voucher._id);
        setSelectedVoucherCode(voucher.code);
        fetchAppliedOrders(voucher.code).then(setAppliedOrders);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrentVoucherId(null);
        setSelectedVoucherCode("");
        setAppliedOrders([]);
    };

    // Form change handler
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Bạn có chắc muốn xóa voucher này?',
            text: 'Hành động này không thể hoàn tác!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Vâng, xóa nó!',
            cancelButtonText: 'Hủy bỏ',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('token');
                    await axios.delete(`http://localhost:5000/api/vouchers/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    Swal.fire('Đã xóa!', 'Voucher đã được xóa thành công.', 'success');
                    fetchVouchers();
                } catch (err) {
                    console.error('Error deleting voucher:', err);
                    Swal.fire('Lỗi!', err.response?.data?.message || 'Không thể xóa voucher.', 'error');
                }
            }
        });
    };

    const getStatusColor = (isExpired, isOutOfStock, isInactive) => {
        if (isExpired || isOutOfStock || isInactive) return '#ef4444'; // red
        return '#10b981'; // green
    };

    const filteredVouchers = vouchers.filter((voucher) =>
        voucher.code.toLowerCase().includes(searchText.toLowerCase()) ||
        voucher.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const sortedVouchers = [...filteredVouchers].sort((a, b) => {
        if (sortType === 'newest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortType === 'oldest') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sortType === 'minOrder_asc') {
            return a.minOrder - b.minOrder;
        } else if (sortType === 'minOrder_desc') {
            return b.minOrder - a.minOrder;
        }
        return 0;
    });

    // Lấy realtime applied orders khi mở modal edit
    useEffect(() => {
        if (isModalOpen && formData.code) {
            fetchAppliedOrders(formData.code).then(setAppliedOrders);
        }
    }, [isModalOpen, formData.code]);

    // Cập nhật realtime số lượng đã dùng khi modal đóng hoặc mở
    useEffect(() => {
        if (!isModalOpen) {
            fetchVouchers();
        }
    }, [isModalOpen]);

    return (
        <div className={styles.container}>
            {/* Hiển thị box báo lỗi validate nổi bật */}
            {error && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.35)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <div style={{
                        background: '#fff',
                        color: '#d32f2f',
                        padding: '32px 40px',
                        borderRadius: 12,
                        fontSize: 20,
                        fontWeight: 600,
                        boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
                        minWidth: 320,
                        textAlign: 'center',
                        position: 'relative',
                    }}>
                        {error}
                        <button onClick={() => setError("")} style={{
                            position: 'absolute',
                            top: 8,
                            right: 16,
                            background: 'none',
                            border: 'none',
                            fontSize: 24,
                            color: '#888',
                            cursor: 'pointer',
                        }}>&times;</button>
                    </div>
                </div>
            )}
            <h1 className={styles.title}>Mã giảm giá</h1>

            <div className={styles.filterBar} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--input-bg)', borderRadius: '8px', flexGrow: 1, padding: '5px 10px', height: '42px' }}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Tìm kiếm theo tên, mã voucher..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ border: 'none', background: 'transparent', flexGrow: 1, outline: 'none', color: 'var(--text-primary)', padding: '0 5px' }}
                    />
                    <BiSearch size={20} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
                </div>

                <select
                    className={styles.select}
                    value={sortType}
                    onChange={e => setSortType(e.target.value)}
                    style={{ width: '150px', height: '42px' }}
                >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="minOrder_asc">Đơn tối thiểu tăng dần</option>
                    <option value="minOrder_desc">Đơn tối thiểu giảm dần</option>
                </select>
                <span style={{ color: 'var(--text-secondary)' }}>Tổng voucher: {filteredVouchers.length}</span>
                <button onClick={handleOpenAddModal} className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: 'auto', padding: '10px 18px', height: '42px' }}>
                    <AiOutlinePlus size={20} style={{ marginRight: '5px' }} />
                    Thêm mới
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải voucher...</div>
            ) : error ? (
                <div className="error-banner">{error}</div>
            ) : (
                <div className={styles.card} style={{ marginTop: 16 }}>
                    <table className={styles.productTable} style={{ fontSize: '16px' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'center' }}>STT</th>
                                <th style={{ textAlign: 'center' }}>Mã</th>
                                <th style={{ textAlign: 'left' }}>Tên mã</th>
                                <th style={{ textAlign: 'center' }}>Loại phiếu giảm giá</th>
                                <th style={{ textAlign: 'center' }}>Đơn Tối Thiểu</th>
                                <th style={{ textAlign: 'right' }}>Giá trị giảm</th>
                                <th style={{ textAlign: 'right' }}>Giảm tối đa</th>
                                <th style={{ textAlign: 'center' }}>Ngày áp dụng</th>
                                <th style={{ textAlign: 'center' }}>Ngày kết thúc</th>
                                <th style={{ textAlign: 'center' }}>Số lượng voucher</th>
                                <th style={{ textAlign: 'center' }}>Số lượng đã áp dụng</th>
                                <th style={{ textAlign: 'center' }}>Số lượng còn lại</th>
                                <th style={{ textAlign: 'center' }}>Trạng thái</th>
                                <th style={{ textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedVouchers.map((v, index) => {
                                const isExpired = new Date(v.endDate) < new Date();
                                const isOutOfStock = v.quantity - v.usedCount <= 0;
                                const isInactive = !v.isActive;
                                const statusText = isExpired || isOutOfStock || isInactive ? 'Dừng áp dụng' : 'Đang áp dụng';
                                const statusColor = getStatusColor(isExpired, isOutOfStock, isInactive);

                                return (
                                    <tr key={v._id}>
                                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                        <td style={{ textAlign: 'center', fontWeight: 500 }}>{v.code}</td>
                                        <td style={{ textAlign: 'left' }}>{v.name}</td>
                                        <td style={{ textAlign: 'center' }}>{v.discountType === 'amount' ? 'Số tiền cố định' : 'Phần trăm'}</td>
                                        <td style={{ textAlign: 'center' }}>{v.minOrder.toLocaleString('vi-VN')}₫</td>
                                        <td style={{ textAlign: 'right' }}>{v.discountType === 'amount' ? `${v.discountValue} ₫` : `${v.discountValue}%`}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            {v.discountType === 'percent' && v.maxDiscount ? `${v.maxDiscount.toLocaleString('vi-VN')}₫` : '--'}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{new Date(v.startDate).toLocaleDateString('vi-VN')}</td>
                                        <td style={{ textAlign: 'center' }}>{new Date(v.endDate).toLocaleDateString('vi-VN')}</td>
                                        <td style={{ textAlign: 'center' }}>{v.quantity}</td>
                                        <td style={{ textAlign: 'center' }}>{v.usedCount}</td>
                                        <td style={{ textAlign: 'center' }}>{(v.quantity - v.usedCount) > 0 ? (v.quantity - v.usedCount) : 0}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={styles.status} style={{ backgroundColor: statusColor, color: 'white' }}>
                                                {statusText}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                <button
                                                    className={`${styles.actionBtn} ${styles.iconBtn}`}
                                                    onClick={() => handleOpenEditModal(v)}
                                                    title="Xem / Sửa Voucher"
                                                >
                                                    <AiOutlineEye size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredVouchers.length === 0 && (
                                <tr>
                                    <td colSpan={14} style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>Không có voucher nào phù hợp</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent} style={{ maxWidth: 900, minWidth: 700, width: '95vw', padding: 20, borderRadius: 12, position: 'relative' }}>
                        <button type="button" onClick={handleCloseModal} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#fff', cursor: 'pointer', zIndex: 2 }}>&times;</button>
                        <h3 className={styles.modalTitle} style={{ marginBottom: 18 }}>
                            {isEditing ? 'Cập nhật Voucher' : 'Thêm Voucher Mới'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            {/* Custom 4-column grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '15px',
                                marginBottom: '20px'
                            }}>
                                {/* Row 1: Mã Voucher, Tên Voucher, Loại Giảm Giá, Giá Trị Giảm Giá */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Mã Voucher:</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        readOnly={isEditing}
                                        className={styles.input}
                                        placeholder="Mã voucher sẽ được tạo tự động"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Tên Voucher:</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className={styles.input}
                                        placeholder="Nhập tên voucher"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Loại Giảm Giá:</label>
                                    <select name="discountType" value={formData.discountType} onChange={handleChange} required className={styles.select}>
                                        <option value="percent">Phần trăm</option>
                                        <option value="amount">Số tiền</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Giá Trị Giảm Giá:</label>
                                    <input
                                        type="number"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        max={formData.discountType === 'percent' ? '100' : undefined}
                                        className={styles.input}
                                        style={{
                                            borderColor:
                                                formData.discountType === 'percent' && formData.discountValue > 90 ? '#ef4444' :
                                                    formData.discountType === 'amount' && formData.minOrder > 0 && formData.discountValue > formData.minOrder * 0.9 ? '#ef4444' :
                                                        undefined
                                        }}
                                    />
                                    <small style={{
                                        color: '#666',
                                        fontSize: '11px',
                                        marginTop: '2px',
                                        display: 'block',
                                        lineHeight: '1.2'
                                    }}>
                                        {formData.discountType === 'percent' ? (
                                            <>
                                                Tối đa 100%. <strong>Khuyến nghị ≤ 90%</strong>
                                                {formData.discountValue > 90 && (
                                                    <span style={{ color: '#ef4444', display: 'block' }}>
                                                        ⚠️ Giảm giá quá cao!
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <strong>Khuyến nghị ≤ 90% đơn tối thiểu</strong>
                                                {formData.minOrder > 0 && formData.discountValue > 0 && (
                                                    <span style={{
                                                        color: formData.discountValue > formData.minOrder * 0.9 ? '#ef4444' : '#10b981',
                                                        display: 'block',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {formData.discountValue > formData.minOrder * 0.9 && '⚠️ '}
                                                        {((formData.discountValue / formData.minOrder) * 100).toFixed(1)}% đơn hàng
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </small>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '15px',
                                marginBottom: '20px'
                            }}>
                                {/* Row 2: Giảm giá tối đa, Đơn Hàng Tối Thiểu, Số lượng voucher, Trạng thái */}
                                {formData.discountType === 'percent' ? (
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Giảm giá tối đa (VND):</label>
                                        <input
                                            type="number"
                                            name="maxDiscount"
                                            value={formData.maxDiscount}
                                            onChange={handleChange}
                                            min="0"
                                            className={styles.input}
                                            placeholder="Nhập số tiền giảm tối đa"
                                        />
                                        <small style={{ color: '#666', fontSize: '11px', marginTop: '2px', display: 'block' }}>
                                            Để trống = không giới hạn
                                        </small>
                                    </div>
                                ) : (
                                    <div></div> // Empty div to maintain grid structure
                                )}

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Đơn Hàng Tối Thiểu:</label>
                                    <input
                                        type="number"
                                        name="minOrder"
                                        value={formData.minOrder}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        className={styles.input}
                                    />
                                    <small style={{
                                        color: '#666',
                                        fontSize: '11px',
                                        marginTop: '2px',
                                        display: 'block'
                                    }}>
                                        Giá trị đơn hàng tối thiểu (VND)
                                    </small>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Số lượng voucher:</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        required
                                        className={styles.input}
                                        min="1"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Trạng thái:</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                        <label htmlFor="isActive" style={{ margin: 0, cursor: 'pointer', fontSize: '14px' }}>
                                            Kích hoạt voucher
                                        </label>
                                    </div>
                                    <small style={{
                                        color: '#666',
                                        fontSize: '11px',
                                        marginTop: '2px',
                                        display: 'block'
                                    }}>
                                        Bỏ chọn để vô hiệu hóa
                                    </small>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '15px',
                                marginBottom: '20px'
                            }}>
                                {/* Row 3: Ngày Bắt Đầu, Ngày Kết Thúc, and 2 empty columns for description */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Ngày Bắt Đầu:</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        required
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Ngày Kết Thúc:</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        required
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                                    <label className={styles.label}>Mô tả:</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className={styles.textarea}
                                        rows="3"
                                        style={{ resize: 'vertical' }}
                                    ></textarea>
                                </div>
                            </div>

                            {error && (
                                <div style={{ color: '#ef4444', marginTop: '10px', padding: '8px', backgroundColor: '#fee', borderRadius: '4px' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleCloseModal}>Hủy</button>
                                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                                    {isEditing ? 'Cập nhật' : 'Thêm'}
                                </button>
                            </div>
                        </form>

                        {selectedVoucherCode && (
                            <div style={{ marginTop: 18, background: '#181c22', borderRadius: 8, padding: 12, maxHeight: 120, overflowY: 'auto' }}>
                                <b>Đơn hàng đã áp dụng voucher:</b>
                                {(!Array.isArray(appliedOrders) || appliedOrders.length === 0) ? (
                                    <div style={{ color: '#aaa', fontSize: 14 }}>Chưa có đơn hàng nào áp dụng voucher này.</div>
                                ) : (
                                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {appliedOrders.map(orderId => (
                                            <li key={orderId} style={{ background: '#2c313a', borderRadius: 4, padding: '4px 10px', fontSize: 15, color: '#fff' }}>{orderId}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Vouchers;