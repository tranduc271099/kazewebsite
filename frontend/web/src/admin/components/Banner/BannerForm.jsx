import React, { useState } from 'react';
import styles from '../../styles/ProductLayout.module.css';
import '../../styles/BannerManagement.css';

const BannerForm = ({ banner, onSubmit, onClose }) => {
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState(banner ? banner.title : ''); // Add title state
    const [isActive, setIsActive] = useState(banner ? banner.isActive : true);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('=== BANNER FORM SUBMIT ===');
        console.log('Banner:', banner);
        console.log('Title:', title);
        console.log('Image:', image);
        console.log('IsActive:', isActive);

        // Validate required fields
        if (!title.trim()) {
            alert('Vui lòng nhập tiêu đề banner');
            return;
        }

        if (!banner && !image) {
            alert('Vui lòng chọn ảnh banner');
            return;
        }

        const formData = new FormData();
        if (image) formData.append('image', image);
        formData.append('title', title); // Append title
        formData.append('isActive', isActive);

        console.log('FormData created, calling onSubmit...');
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <h2>{banner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}</h2>
                    <div className="form-group">
                        <label>Tiêu đề banner *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className="form-group">
                        <label>Ảnh banner *</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} required={!banner} className={styles.input} />
                    </div>
                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={e => setIsActive(e.target.checked)}
                            />
                            Đang hoạt động
                        </label>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Lưu</button>
                        <button type="button" onClick={onClose} className="btn-cancel">Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BannerForm;