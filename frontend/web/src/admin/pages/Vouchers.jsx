import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Swal from 'sweetalert2';
import { BiSearch } from 'react-icons/bi';
import { AiOutlineEye, AiOutlineEdit } from 'react-icons/ai';
import { AiOutlinePlus } from 'react-icons/ai'; // Import for the plus icon
// @ts-ignore
import styles from '../styles/ProductLayout.module.css';

const initialFormState = {
    code: '', // Sẽ được tạo trong component
    name: '',
    description: '',
    minOrder: '',  // Keep as string for form input consistency
    discountType: 'percent',
    discountValue: '',
    startDate: '',
    endDate: '',
    quantity: '',
    isActive: true,
};

function generateVoucherCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const Vouchers = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ ...initialFormState, code: generateVoucherCode() }); // Tạo mã voucher ban đầu
    const [isEditing, setIsEditing] = useState(false);
    const [currentVoucherId, setCurrentVoucherId] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [sortType, setSortType] = useState('newest'); // Add sortType state

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/vouchers', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setVouchers(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching vouchers:', err);
            setError('Failed to fetch vouchers.');
            setVouchers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setIsEditing(false);
        setCurrentVoucherId(null);
        const newCode = generateVoucherCode();
        setFormData({ ...initialFormState, code: newCode });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (voucher) => {
        setIsEditing(true);
        setCurrentVoucherId(voucher._id);
        const formattedStartDate = voucher.startDate && !isNaN(new Date(voucher.startDate).getTime())
            ? format(new Date(voucher.startDate), 'yyyy-MM-dd')
            : '';
        const formattedEndDate = voucher.endDate && !isNaN(new Date(voucher.endDate).getTime())
            ? format(new Date(voucher.endDate), 'yyyy-MM-dd')
            : '';

        setFormData({
            code: voucher.code || '',
            name: voucher.name || '',
            description: voucher.description || '',
            minOrder: voucher.minOrder?.toString() || '',
            discountType: voucher.discountType || 'percent',
            discountValue: voucher.discountValue?.toString() || '',
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            quantity: voucher.quantity?.toString() || '',
            isActive: voucher.isActive !== undefined ? voucher.isActive : true
        });
        setIsModalOpen(true);
    };

    // Keep the old function for backward compatibility
    const handleOpenModal = (voucher = null) => {
        if (voucher) {
            handleOpenEditModal(voucher);
        } else {
            handleOpenAddModal();
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrentVoucherId(null);
        setFormData({ ...initialFormState, code: generateVoucherCode() });
    };

    const handleChange = async (e) => {
        const { name, value } = e.target;

        // Validation khi nhập giá trị giảm giá
        if (name === 'discountValue') {
            const numValue = Number(value);

            // Kiểm tra phần trăm không vượt quá 100%
            if (formData.discountType === 'percent' && numValue > 100) {
                Swal.fire('Lỗi!', 'Giá trị giảm phần trăm không được vượt quá 100%', 'error');
                return;
            }

            // Kiểm tra phần trăm không vượt quá 90% để tránh lỗ (giữ lại 10% lợi nhuận tối thiểu)
            if (formData.discountType === 'percent' && numValue > 90) {
                const result = await Swal.fire({
                    title: 'Cảnh báo!',
                    text: 'Giảm giá trên 90% có thể dẫn đến lỗ. Bạn có chắc muốn tiếp tục?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Vẫn tiếp tục',
                    cancelButtonText: 'Hủy bỏ'
                });

                if (!result.isConfirmed) {
                    return;
                }
            }

            // Kiểm tra số tiền giảm không âm
            if (formData.discountType === 'amount' && numValue < 0) {
                Swal.fire('Lỗi!', 'Số tiền giảm giá không được âm', 'error');
                return;
            }

            // Cảnh báo nếu số tiền giảm quá lớn so với đơn hàng tối thiểu
            if (formData.discountType === 'amount' && formData.minOrder > 0 && numValue > formData.minOrder * 0.9) {
                const result = await Swal.fire({
                    title: 'Cảnh báo!',
                    text: 'Số tiền giảm giá lớn (trên 90% giá trị đơn hàng tối thiểu) có thể dẫn đến lỗ. Bạn có chắc muốn tiếp tục?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Vẫn tiếp tục',
                    cancelButtonText: 'Hủy bỏ'
                });

                if (!result.isConfirmed) {
                    return;
                }
            }
        }

        // Validation cho đơn hàng tối thiểu
        if (name === 'minOrder') {
            const numValue = Number(value);
            if (numValue < 0) {
                Swal.fire('Lỗi!', 'Giá trị đơn hàng tối thiểu không được âm', 'error');
                return;
            }

            // Kiểm tra lại nếu có giá trị giảm giá dạng amount
            if (formData.discountType === 'amount' && formData.discountValue > 0 && formData.discountValue > numValue * 0.9) {
                Swal.fire('Cảnh báo!', 'Số tiền giảm giá hiện tại có thể quá lớn so với đơn hàng tối thiểu mới', 'warning');
            }
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create payload with only the specific fields we need to avoid circular structure
        const payload = {
            code: formData.code,
            name: formData.name,
            description: formData.description,
            discountType: formData.discountType,
            discountValue: Number(formData.discountValue),
            minOrder: Number(formData.minOrder),
            quantity: Number(formData.quantity),
            startDate: formData.startDate,
            endDate: formData.endDate,
            isActive: formData.isActive,
        };

        // Validation comprehensive trước khi submit

        // 1. Kiểm tra giá trị giảm giá không được âm
        if (payload.discountValue < 0) {
            Swal.fire('Lỗi!', 'Giá trị giảm giá không được âm.', 'error');
            return;
        }

        // 2. Validation cho discountType === 'percent'
        if (payload.discountType === 'percent') {
            if (payload.discountValue > 100) {
                Swal.fire('Lỗi!', 'Giá trị giảm phần trăm không được vượt quá 100%.', 'error');
                return;
            }

            if (payload.discountValue > 95) {
                const result = await Swal.fire({
                    title: 'Cảnh báo!',
                    text: `Giảm giá ${payload.discountValue}% có thể dẫn đến lỗ nghiêm trọng. Bạn có chắc chắn muốn tiếp tục?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Vẫn tiếp tục',
                    cancelButtonText: 'Hủy bỏ'
                });

                if (!result.isConfirmed) {
                    return;
                }
            }
        }

        // 3. Validation cho discountType === 'amount'
        if (payload.discountType === 'amount') {
            // Kiểm tra số tiền giảm không vượt quá đơn hàng tối thiểu
            if (payload.minOrder > 0 && payload.discountValue >= payload.minOrder) {
                Swal.fire('Lỗi!', 'Số tiền giảm giá không được bằng hoặc vượt quá giá trị đơn hàng tối thiểu.', 'error');
                return;
            }

            // Cảnh báo nếu giảm quá nhiều (trên 90% đơn hàng tối thiểu)
            if (payload.minOrder > 0 && payload.discountValue > payload.minOrder * 0.9) {
                const result = await Swal.fire({
                    title: 'Cảnh báo!',
                    text: `Số tiền giảm giá ${payload.discountValue.toLocaleString('vi-VN')}₫ chiếm ${((payload.discountValue / payload.minOrder) * 100).toFixed(1)}% giá trị đơn hàng tối thiểu. Điều này có thể dẫn đến lỗ. Bạn có chắc chắn muốn tiếp tục?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Vẫn tiếp tục',
                    cancelButtonText: 'Hủy bỏ'
                });

                if (!result.isConfirmed) {
                    return;
                }
            }
        }

        // 4. Kiểm tra ngày bắt đầu và kết thúc
        if (new Date(payload.startDate) >= new Date(payload.endDate)) {
            Swal.fire('Lỗi!', 'Ngày bắt đầu phải trước ngày kết thúc.', 'error');
            return;
        }

        // 5. Kiểm tra số lượng voucher
        if (payload.quantity <= 0) {
            Swal.fire('Lỗi!', 'Số lượng voucher phải lớn hơn 0.', 'error');
            return;
        }

        Swal.fire({
            title: isEditing ? 'Cập nhật voucher' : 'Thêm voucher mới',
            text: isEditing ? 'Đang cập nhật voucher...' : 'Đang thêm voucher...',
            icon: 'info',
            allowOutsideClick: false,
            showConfirmButton: false,
        });

        try {
            const token = localStorage.getItem('token');
            if (isEditing) {
                await axios.put(`http://localhost:5000/api/vouchers/${currentVoucherId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                Swal.fire('Thành công!', 'Voucher đã được cập nhật.', 'success');
            } else {
                await axios.post('http://localhost:5000/api/vouchers', payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                Swal.fire('Thành công!', 'Voucher mới đã được thêm.', 'success');
            }
            fetchVouchers();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving voucher:', err);
            Swal.fire('Lỗi!', err.response?.data?.message || 'Không thể lưu voucher.', 'error');
        }
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

    return (
        <div className={styles.container}>
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
                                <th style={{ textAlign: 'center' }}>Ngày áp dụng</th>
                                <th style={{ textAlign: 'center' }}>Ngày kết thúc</th>
                                <th style={{ textAlign: 'center' }}>Số lượng còn lại</th>
                                <th style={{ textAlign: 'center' }}>Số lượng đã dùng</th>
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
                                        <td style={{ textAlign: 'center' }}>{new Date(v.startDate).toLocaleDateString('vi-VN')}</td>
                                        <td style={{ textAlign: 'center' }}>{new Date(v.endDate).toLocaleDateString('vi-VN')}</td>
                                        <td style={{ textAlign: 'center' }}>{(v.quantity - v.usedCount) > 0 ? (v.quantity - v.usedCount) : 0}</td>
                                        <td style={{ textAlign: 'center' }}>{v.usedCount}</td>
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
                                    <td colSpan={10} style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>Không có voucher nào phù hợp</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>
                            {isEditing ? 'Cập nhật Voucher' : 'Thêm Voucher Mới'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className={`${styles.formGrid} ${styles.gridCol2}`}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Mã Voucher:</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        readOnly={isEditing}
                                        required
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
                                    />
                                </div>

                                <div className={`${styles.formGroup} ${styles.span2}`}> {/* Mô tả spans two columns */}
                                    <label className={styles.label}>Mô tả:</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className={styles.textarea}
                                        rows="3"
                                    ></textarea>
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
                                        fontSize: '12px',
                                        marginTop: '4px',
                                        display: 'block'
                                    }}>
                                        {formData.discountType === 'percent' ? (
                                            <>
                                                Tối đa 100%. <strong>Khuyến nghị ≤ 90%</strong> để tránh lỗ
                                                {formData.discountValue > 90 && (
                                                    <span style={{ color: '#ef4444', display: 'block' }}>
                                                        ⚠️ Cảnh báo: Giảm giá quá cao có thể dẫn đến lỗ!
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                Số tiền giảm giá (VND). <strong>Khuyến nghị ≤ 90% đơn hàng tối thiểu</strong>
                                                {formData.minOrder > 0 && formData.discountValue > 0 && (
                                                    <span style={{
                                                        color: formData.discountValue > formData.minOrder * 0.9 ? '#ef4444' : '#10b981',
                                                        display: 'block',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {formData.discountValue > formData.minOrder * 0.9 && '⚠️ '}
                                                        Chiếm {((formData.discountValue / formData.minOrder) * 100).toFixed(1)}% đơn hàng tối thiểu
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </small>
                                </div>

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
                                        fontSize: '12px',
                                        marginTop: '4px',
                                        display: 'block'
                                    }}>
                                        Giá trị đơn hàng tối thiểu để áp dụng voucher (VND)
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
                                        min="1" // Ensure quantity is at least 1
                                    />
                                </div>

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

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Trạng thái:</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                        <label htmlFor="isActive" style={{ margin: 0, cursor: 'pointer' }}>
                                            Kích hoạt voucher
                                        </label>
                                    </div>
                                    <small style={{
                                        color: '#666',
                                        fontSize: '12px',
                                        marginTop: '4px',
                                        display: 'block'
                                    }}>
                                        Bỏ chọn để vô hiệu hóa voucher này
                                    </small>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleCloseModal}>Hủy</button>
                                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                                    {isEditing ? 'Cập nhật' : 'Thêm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vouchers; 