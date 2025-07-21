import React, { useState } from 'react';

const BannerForm = ({ banner, onSubmit, onClose }) => {
    const [image, setImage] = useState(null);
    const [isActive, setIsActive] = useState(banner ? banner.isActive : true);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (image) formData.append('image', image);
        formData.append('isActive', isActive);
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <h2>{banner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}</h2>
                    <div className="form-group">
                        <label>Ảnh banner *</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} required={!banner} />
                    </div>
                    <div className="form-group form-group-checkbox">
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
                        <button type="submit" className="btn-save">Lưu</button>
                        <button type="button" onClick={onClose} className="btn-cancel">Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BannerForm;