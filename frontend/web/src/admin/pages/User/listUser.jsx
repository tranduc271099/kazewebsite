import React from 'react';

const ListUser = ({ users, currentUser, handleEdit, handleDelete, handleViewHistory, loading, error }) => {
    if (loading) return <div>Đang tải...</div>;
    return (
        <div className="table-responsive">
            {error && <div className="error-message">{error}</div>}
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user._id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="btn btn-primary btn-sm me-2"
                                        onClick={() => handleEdit(user)}
                                        disabled={currentUser?.role === 'admin' && user.role === 'admin' && currentUser._id !== user._id}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="btn btn-info btn-sm me-2"
                                        onClick={() => handleViewHistory(user)}
                                        title="Xem lịch sử chỉnh sửa"
                                    >
                                        <i className="fas fa-history"></i> Lịch sử
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm me-2"
                                        onClick={() => handleDelete(user._id)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListUser; 