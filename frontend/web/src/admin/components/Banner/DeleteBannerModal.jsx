import React from 'react';

const DeleteBannerModal = ({ onConfirm, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content modal-sm">
                <h2>Xác nhận Xóa</h2>
                <p>Bạn có chắc chắn muốn xóa banner này không? Hành động này không thể hoàn tác.</p>
                <div className="form-actions">
                    <button onClick={onConfirm} className="btn-delete">Xác nhận Xóa</button>
                    <button onClick={onClose} className="btn-cancel">Hủy</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteBannerModal;