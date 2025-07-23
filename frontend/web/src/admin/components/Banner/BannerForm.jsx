import React, { useState } from 'react';
import styles from '../../styles/ProductLayout.module.css';

const BannerForm = ({ banner, onSubmit, onClose }) => {
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState(banner ? banner.title : ''); // Add title state
    const [isActive, setIsActive] = useState(banner ? banner.isActive : true);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (image) formData.append('image', image);
        formData.append('title', title); // Append title
        formData.append('isActive', isActive);
        onSubmit(formData);
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <form onSubmit={handleSubmit}>
                    <h3 className={styles.modalTitle}>{banner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}</h3>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Tiêu đề banner *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Ảnh banner *</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} required={!banner} className={styles.input} />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={e => setIsActive(e.target.checked)}
                            />
                            Đang hoạt động
                        </label>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Lưu</button>
                        <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BannerForm;