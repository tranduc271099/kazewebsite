import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import '../../styles/UserHistoryModal.css';

const UserHistoryModal = ({ isOpen, onClose, userId, userName }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && userId) {
            fetchHistory();
        }
    }, [isOpen, userId]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/users/admin/users/${userId}/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(response.data);
        } catch (err) {
            setError('Không thể tải lịch sử chỉnh sửa');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss', { locale: vi });
        } catch (error) {
            return dateString;
        }
    };

    const getChangeDescription = (changes) => {
        const descriptions = [];
        if (changes.name) descriptions.push(`Tên: "${changes.name}"`);
        if (changes.email) descriptions.push(`Email: "${changes.email}"`);
        if (changes.role) descriptions.push(`Vai trò: "${changes.role}"`);
        if (changes.isLocked !== undefined) {
            descriptions.push(`Trạng thái: "${changes.isLocked ? 'Đã khóa' : 'Đã mở khóa'}"`);
        }
        return descriptions.join(' | ');
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-backdrop" onClick={onClose}></div>
            <button 
                className="modal-close-button" 
                onClick={onClose}
                title="Đóng"
            >
                ×
            </button>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                <i className="fas fa-history me-2"></i>
                                Lịch sử chỉnh sửa - {userName}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                            ></button>
                        </div>
                        <div className="modal-body">
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Đang tải...</span>
                                    </div>
                                    <p className="mt-2">Đang tải lịch sử...</p>
                                </div>
                            ) : error ? (
                                <div className="alert alert-danger">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {error}
                                </div>
                            ) : history.length === 0 ? (
                                <div className="no-history-message">
                                    <i className="fas fa-inbox"></i>
                                    <p>Chưa có lịch sử chỉnh sửa</p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-3">
                                        <small className="text-muted">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Tổng cộng {history.length} lần chỉnh sửa
                                        </small>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-striped history-table">
                                            <thead>
                                                <tr>
                                                    <th>Thời gian</th>
                                                    <th>Chỉnh sửa bởi</th>
                                                    <th>Tên</th>
                                                    <th>Email</th>
                                                    <th>Vai trò</th>
                                                    <th>Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {history.map((entry, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <i className="fas fa-clock me-1"></i>
                                                            {formatDate(entry.updatedAt)}
                                                        </td>
                                                        <td>
                                                            {entry.updatedBy ? (
                                                                <span>
                                                                    <i className="fas fa-user me-1"></i>
                                                                    {entry.updatedBy.name} 
                                                                    <small className="text-muted d-block">
                                                                        ({entry.updatedBy.email})
                                                                    </small>
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted">
                                                                    <i className="fas fa-user-slash me-1"></i>
                                                                    Không xác định
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {entry.changes.name ? (
                                                                <span className="badge bg-info">
                                                                    {entry.changes.name}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {entry.changes.email ? (
                                                                <span className="badge bg-info">
                                                                    {entry.changes.email}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {entry.changes.role ? (
                                                                <span className="badge bg-info">
                                                                    {entry.changes.role}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {entry.changes.isLocked !== undefined ? (
                                                                <span className={`badge ${entry.changes.isLocked ? 'bg-danger' : 'bg-success'}`}>
                                                                    {entry.changes.isLocked ? 'Đã khóa' : 'Đã mở khóa'}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                <i className="fas fa-times me-1"></i>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserHistoryModal; 