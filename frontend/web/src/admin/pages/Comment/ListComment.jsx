import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BiSearch, BiFilter } from 'react-icons/bi';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete, AiOutlineFlag } from 'react-icons/ai';
import { FaReply, FaEye, FaEyeSlash, FaCheck, FaTimes, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import styles from '../../styles/ProductLayout.module.css';
import '../../styles/CommentManagement.css';
import '../../../styles/CommentManagement.custom.css';

const ListComment = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    // Modal states
    const [selectedComment, setSelectedComment] = useState(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [searchTerm, statusFilter, page]);

    const fetchComments = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }
            if (searchTerm) {
                params.append('search', searchTerm);
            }
            params.append('page', page);
            params.append('limit', limit);

            const response = await axios.get(`http://localhost:5000/api/comments/admin/all?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(response.data.comments);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi tải danh sách bình luận');
            setComments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (commentId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/comments/admin/${commentId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Đã cập nhật trạng thái thành ${getStatusText(newStatus)}`);
            fetchComments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
        }
    };

    const handleReply = async () => {
        if (!replyContent.trim()) {
            toast.error('Vui lòng nhập nội dung phản hồi');
            return;
        }

        setReplyLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/comments/admin/${selectedComment._id}/reply`,
                { content: replyContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Đã phản hồi bình luận thành công');
            setShowReplyModal(false);
            setReplyContent('');
            setSelectedComment(null);
            fetchComments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi phản hồi bình luận');
        } finally {
            setReplyLoading(false);
        }
    };

    const handleToggleVisibility = async (commentId, isHidden) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/comments/admin/${commentId}/visibility`,
                { isHidden: !isHidden },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(isHidden ? 'Đã hiện bình luận' : 'Đã ẩn bình luận');
            fetchComments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi thay đổi trạng thái hiển thị');
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/comments/admin/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Đã xóa bình luận thành công');
            fetchComments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi xóa bình luận');
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Chờ duyệt';
            case 'approved': return 'Đã duyệt';
            case 'rejected': return 'Bị từ chối';
            default: return status;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <FaClock className="text-warning" />;
            case 'approved': return <FaCheckCircle className="text-success" />;
            case 'rejected': return <FaTimesCircle className="text-danger" />;
            default: return null;
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'bg-warning text-dark';
            case 'approved': return 'bg-success text-white';
            case 'rejected': return 'bg-danger text-white';
            default: return 'bg-secondary text-white';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    };

    const renderStars = (rating) => {
        return Array(5).fill(null).map((_, index) => (
            <span key={index} className={index < rating ? 'text-warning' : 'text-muted'}>
                ★
            </span>
        ));
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Quản lý bình luận</h1>
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Filter Bar */}
            <div className={styles.filterBar} style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Tìm kiếm bình luận..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flexGrow: 1, minWidth: '200px' }}
                />

                <select
                    className={styles.select}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ minWidth: '150px' }}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Bị từ chối</option>
                </select>

                <button onClick={fetchComments} className={`${styles.btn} ${styles.btnPrimary}`}>
                    <BiSearch size={20} />
                </button>
            </div>

            {/* Comments Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải danh sách bình luận...</div>
            ) : comments.length > 0 ? (
                <div className={styles.card}>
                    <table className={styles.productTable} style={{ fontSize: '1.1rem' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '5%', textAlign: 'center', verticalAlign: 'middle' }}>STT</th>
                                <th style={{ width: '13%', textAlign: 'center', verticalAlign: 'middle' }}>Người dùng</th>
                                <th style={{ width: '15%', textAlign: 'center', verticalAlign: 'middle' }}>Email</th>
                                <th style={{ width: '18%', textAlign: 'left', verticalAlign: 'middle' }}>Sản phẩm</th>
                                <th style={{ width: '25%', textAlign: 'left', verticalAlign: 'middle' }}>Nội dung</th>
                                <th style={{ width: '8%', textAlign: 'center', verticalAlign: 'middle' }}>Đánh giá</th>
                                <th style={{ width: '10%', textAlign: 'center', verticalAlign: 'middle' }}>Trạng thái</th>
                                <th style={{ width: '12%', textAlign: 'center', verticalAlign: 'middle' }}>Ngày tạo</th>
                                <th style={{ width: '15%', textAlign: 'center', verticalAlign: 'middle' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comments.map((comment, index) => (
                                <tr key={comment._id}>
                                    <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '15px 8px' }}>{(page - 1) * limit + index + 1}</td>
                                    <td style={{ padding: '15px 8px', textAlign: 'center', verticalAlign: 'middle', display: 'table-cell' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                            <span style={{ fontSize: '1rem' }}>{comment.userId?.name || 'Ẩn danh'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px 8px', textAlign: 'center', verticalAlign: 'middle', display: 'table-cell' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                            <span style={{ fontSize: '1rem' }}>{comment.userId?.email || ''}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px 8px', verticalAlign: 'middle' }}>
                                        {console.log('Product ID:', comment.productId)}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {/* Ảnh sản phẩm */}
                                            <div style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                                                <img
                                                    src={comment.productId?.images && comment.productId.images[0] ?
                                                        (comment.productId.images[0].startsWith('http') ?
                                                            comment.productId.images[0] :
                                                            `http://localhost:5000${comment.productId.images[0]}`) :
                                                        'https://via.placeholder.com/50x50/cccccc/666666?text=No+Image'}
                                                    alt="Product"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        borderRadius: '6px',
                                                        border: '1px solid #ddd'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/50x50/cccccc/666666?text=No+Image';
                                                    }}
                                                />
                                            </div>
                                            {/* Tên sản phẩm */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                                                    {comment.productId?.name || 'Không có tên'}
                                                </div>
                                                {comment.productId?.brand && (
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                                                        {comment.productId.brand}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px 8px', verticalAlign: 'middle' }}>
                                        <div className="adminReply" style={{ margin: 0 }}>
                                            <div className="user-header" style={{ color: '#2563eb', fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
                                                <i className="bi bi-person-circle me-2"></i>Phản hồi từ người dùng
                                            </div>
                                            <div className="admin-content" style={{ marginBottom: 0 }}>
                                                {comment.content}
                                            </div>
                                        </div>
                                        {comment.adminReply && (
                                            <div className="adminReply">
                                                <div className="admin-header">
                                                    <i className="bi bi-shield-check me-2"></i>
                                                    Phản hồi từ Admin
                                                </div>
                                                <div className="admin-content">
                                                    {comment.adminReply.content}
                                                </div>
                                                <div className="admin-meta">
                                                    {comment.adminReply.adminId?.name} - {formatDate(comment.adminReply.repliedAt)}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '15px 8px' }}>
                                        <div style={{ fontSize: '1.2rem' }}>{renderStars(comment.rating)}</div>
                                        <small style={{ fontSize: '0.9rem' }}>({comment.rating}/5)</small>
                                    </td>
                                    <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '15px 8px' }}>
                                        <span className={`badge ${getStatusBadgeClass(comment.status)}`} style={{ fontSize: '0.9rem', padding: '8px 12px' }}>
                                            {getStatusIcon(comment.status)} {getStatusText(comment.status)}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '15px 8px' }}>
                                        <small style={{ fontSize: '0.9rem' }}>{formatDate(comment.createdAt)}</small>
                                    </td>
                                    <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '15px 8px' }}>
                                        <div className="d-flex gap-2 justify-content-center flex-wrap">
                                            {/* <button
                                                className={`${styles.actionBtn} btn-sm`}
                                                style={{ fontSize: '1rem', padding: '8px 10px' }}
                                                onClick={() => {
                                                    setSelectedComment(comment);
                                                    setShowDetailModal(true);
                                                }}
                                                title="Xem chi tiết"
                                            >
                                                <AiOutlineEye size={16} />
                                            </button> */}
                                            <button
                                                className={`${styles.actionBtn} btn-sm`}
                                                style={{ fontSize: '1rem', padding: '8px 10px' }}
                                                onClick={() => {
                                                    setSelectedComment(comment);
                                                    setShowReplyModal(true);
                                                }}
                                                title="Phản hồi"
                                            >
                                                <FaReply size={16} />
                                            </button>
                                            {comment.status === 'pending' && (
                                                <>
                                                    <button
                                                        className={`${styles.actionBtn} btn-sm btn-success`}
                                                        style={{ fontSize: '1rem', padding: '8px 10px' }}
                                                        onClick={() => handleStatusUpdate(comment._id, 'approved')}
                                                        title="Duyệt bình luận"
                                                    >
                                                        <FaCheck size={16} />
                                                    </button>
                                                    <button
                                                        className={`${styles.actionBtn} btn-sm btn-danger`}
                                                        style={{ fontSize: '1rem', padding: '8px 10px' }}
                                                        onClick={() => handleStatusUpdate(comment._id, 'rejected')}
                                                        title="Từ chối bình luận"
                                                    >
                                                        <FaTimes size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                className={`${styles.actionBtn} btn-sm ${comment.isHidden ? 'btn-success' : 'btn-warning'}`}
                                                style={{ fontSize: '1rem', padding: '8px 10px' }}
                                                onClick={() => handleToggleVisibility(comment._id, comment.isHidden)}
                                                title={comment.isHidden ? 'Hiện bình luận' : 'Ẩn bình luận'}
                                            >
                                                {comment.isHidden ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                                            </button>
                                            <button
                                                className={`${styles.actionBtn} btn-sm btn-danger`}
                                                style={{ fontSize: '1rem', padding: '8px 10px' }}
                                                onClick={() => handleDelete(comment._id)}
                                                title="Xóa bình luận"
                                            >
                                                <AiOutlineDelete size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <nav>
                                <ul className="pagination">
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setPage(page - 1)}>
                                            Trước
                                        </button>
                                    </li>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                        <li key={pageNum} className={`page-item ${pageNum === page ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(pageNum)}>
                                                {pageNum}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setPage(page + 1)}>
                                            Sau
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.card}>
                    <p className="text-center text-muted">Không có bình luận nào.</p>
                </div>
            )}

            {/* Reply Modal */}
            {showReplyModal && selectedComment && (
                <div className="modal-backdrop" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '90%',
                        maxWidth: '500px'
                    }}>
                        <h4>Phản hồi bình luận</h4>
                        <div className="mb-3">
                            <strong>Bình luận của:</strong> {selectedComment.userId?.name}
                        </div>
                        <div className="mb-3">
                            <strong>Nội dung:</strong> {selectedComment.content}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Phản hồi của admin:</label>
                            <textarea
                                className="form-control"
                                rows="4"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Nhập phản hồi của bạn..."
                            />
                        </div>
                        <div className="d-flex gap-2 justify-content-end">
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowReplyModal(false);
                                    setReplyContent('');
                                    setSelectedComment(null);
                                }}
                                disabled={replyLoading}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleReply}
                                disabled={replyLoading}
                            >
                                {replyLoading ? 'Đang gửi...' : 'Gửi phản hồi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedComment && (
                <div className="modal-backdrop" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <h4>Chi tiết bình luận</h4>

                        <div className="row">
                            <div className="col-md-6">
                                <strong>Người dùng:</strong> {selectedComment.userId?.name}
                            </div>
                            <div className="col-md-6">
                                <strong>Email:</strong> {selectedComment.userId?.email}
                            </div>
                        </div>

                        <div className="row mt-2">
                            <div className="col-md-6">
                                <strong>Sản phẩm:</strong> {selectedComment.productId?.ten_san_pham}
                            </div>
                            <div className="col-md-6">
                                <strong>Đánh giá:</strong> {renderStars(selectedComment.rating)} ({selectedComment.rating}/5)
                            </div>
                        </div>

                        <div className="mt-3">
                            <strong>Nội dung:</strong>
                            <div className="p-3 bg-light rounded mt-1">
                                {selectedComment.content}
                            </div>
                        </div>

                        {selectedComment.adminReply && (
                            <div className="mt-3">
                                <strong>Phản hồi của admin:</strong>
                                <div className="p-3 bg-primary text-white rounded mt-1">
                                    {selectedComment.adminReply.content}
                                    <br />
                                    <small>Bởi: {selectedComment.adminReply.adminId?.name} - {formatDate(selectedComment.adminReply.repliedAt)}</small>
                                </div>
                            </div>
                        )}

                        {selectedComment.reports && selectedComment.reports.length > 0 && (
                            <div className="mt-3">
                                <strong>Báo cáo ({selectedComment.reports.length}):</strong>
                                {selectedComment.reports.map((report, index) => (
                                    <div key={index} className="p-2 bg-warning rounded mt-1">
                                        <strong>Lý do:</strong> {report.reason}
                                        {report.description && (
                                            <div><strong>Mô tả:</strong> {report.description}</div>
                                        )}
                                        <small>Bởi: {report.userId?.name} - {formatDate(report.reportedAt)}</small>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="row mt-3">
                            <div className="col-md-6">
                                <strong>Trạng thái:</strong> {getStatusText(selectedComment.status)}
                            </div>
                            <div className="col-md-6">
                                <strong>Ngày tạo:</strong> {formatDate(selectedComment.createdAt)}
                            </div>
                        </div>

                        <div className="d-flex justify-content-end mt-3">
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setSelectedComment(null);
                                }}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListComment;