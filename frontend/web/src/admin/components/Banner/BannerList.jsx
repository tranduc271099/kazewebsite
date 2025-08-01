import React from 'react';
import styles from '../../styles/ProductLayout.module.css';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';

const BannerList = ({ banners, onEdit, onDelete }) => {
    const getStatusColor = (isActive) => {
        return isActive ? '#10b981' : '#ef4444'; // Green for active, red for inactive
    };

    return (
        <div className={styles.card} style={{ marginTop: 16 }}>
            <table className={styles.productTable}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'center' }}>STT</th>
                        <th style={{ textAlign: 'left' }}>Hình ảnh</th>
                        <th style={{ textAlign: 'left' }}>Tiêu đề</th> {/* Add Title column */}
                        <th style={{ textAlign: 'center' }}>Trạng thái</th>
                        <th style={{ textAlign: 'center' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {banners.length > 0 ? (
                        banners.map((banner, index) => (
                            <tr key={banner._id}>
                                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                <td>
                                    {banner.imageUrl && (
                                        <img
                                            src={banner.imageUrl}
                                            alt="Banner"
                                            className={styles.productImage}
                                        />
                                    )}
                                </td>
                                <td style={{ textAlign: 'left' }}>{banner.title || '---'}</td> {/* Display Title */}
                                <td style={{ textAlign: 'center' }}>
                                    <span
                                        className={styles.status}
                                        style={{ backgroundColor: getStatusColor(banner.isActive), color: 'white' }}
                                    >
                                        {banner.isActive ? 'Đang hoạt động' : 'Dừng hoạt động'}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                        <button
                                            onClick={() => onEdit(banner)}
                                            className={`${styles.actionBtn} ${styles.iconBtn}`}
                                            title="Sửa"
                                        >
                                            <AiOutlineEdit size={20} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(banner)}
                                            className={`${styles.actionBtn} ${styles.iconBtn}`}
                                            style={{ color: '#ef4444' }} // Red for delete
                                            title="Xóa"
                                        >
                                            <AiOutlineDelete size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Không có banner nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default BannerList;