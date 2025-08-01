import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import styles from '../../styles/ProductLayout.module.css';
import '../../styles/BannerManagement.css';
import toast from 'react-hot-toast';

const BannerForm = ({ banner, onSubmit, onClose }) => {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(banner?.image || null);
    const [title, setTitle] = useState(banner ? banner.title : ''); // Add title state
    const [isActive, setIsActive] = useState(banner ? banner.isActive : true);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const getImageUrl = (imgData) => {
        if (!imgData) return null;

        // Nếu là file blob từ FileReader
        if (typeof imgData === 'string' && imgData.startsWith('data:')) {
            return imgData;
        }

        // Nếu là string URL
        if (typeof imgData === 'string') {
            if (imgData.startsWith('http') || imgData.startsWith('blob:')) {
                return imgData;
            }
            if (imgData.startsWith('/uploads/')) {
                return `http://localhost:5000${imgData}`;
            }
            return `http://localhost:5000/uploads/${imgData}`;
        }

        return imgData;
    };

    const validateFile = (file) => {
        if (!file) return false;

        // Kiểm tra loại file
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF)');
            return false;
        }

        // Kiểm tra kích thước (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('Kích thước file không được vượt quá 5MB');
            return false;
        }

        return true;
    };

    const processFile = (file) => {
        if (!validateFile(file)) return;

        setImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
        toast.success('Đã tải ảnh thành công!');
    }; const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleZoneClick = () => {
        fileInputRef.current?.click();
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        toast.success('Đã xóa ảnh');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

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

                        {/* Drag & Drop Zone */}
                        <div
                            className={`${styles.dragDropZone} ${isDragOver ? styles.dragOver : ''} ${imagePreview ? styles.hasImages : ''}`}
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={handleZoneClick}
                        >
                            {!imagePreview ? (
                                <div className={styles.dragDropContent}>
                                    <div className={styles.dragDropIcon}>📷</div>
                                    <p className={styles.dragDropText}>
                                        Kéo thả ảnh vào đây hoặc <span className={styles.clickText}>nhấp để chọn</span>
                                    </p>
                                    <p className={styles.dragDropSubtext}>
                                        Hỗ trợ: JPG, PNG, GIF (tối đa 5MB mỗi file)
                                    </p>
                                </div>
                            ) : (
                                <div className={styles.imagePreviewContainer}>
                                    <div className={styles.imagePreviewItem}>
                                        <img
                                            src={getImageUrl(imagePreview)}
                                            alt="Preview"
                                            className={styles.imagePreview}
                                            style={{ width: '200px', height: '120px', objectFit: 'cover' }}
                                        />
                                        <button
                                            type="button"
                                            className={styles.removeImageBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeImage();
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className={styles.hiddenInput}
                            required={!banner && !imagePreview}
                        />
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