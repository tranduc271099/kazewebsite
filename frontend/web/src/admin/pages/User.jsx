import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/User.css';
import UserHistory from './User/UserHistory';
import UserDetail from './User/UserDetail';

const User = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [userHistory, setUserHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const [expandedUserId, setExpandedUserId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (err) {
            setError('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const openDetail = (user) => {
        setExpandedUserId(expandedUserId === user._id ? null : user._id);
    };

    const fetchUserHistory = async (userId) => {
        try {
            setHistoryLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/users/admin/users/${userId}/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserHistory(response.data);
            setShowModal(true);
        } catch (err) {
            alert('Không thể tải lịch sử chỉnh sửa');
        } finally {
            setHistoryLoading(false);
        }
    };

    const closeHistoryModal = () => {
        setShowModal(false);
        setUserHistory([]);
        setSelectedUser(null);
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div className="error">{error}</div>;

    const userList = users.filter(u => u.role === 'user');
    const adminList = users.filter(u => u.role === 'admin');

    return (
        <div className="content-inner">
            <div className="user-container">
                <div className="user-header">
                    <h2>Quản lý tài khoản</h2>
                </div>
                <div className="table-responsive">
                    <h3>Danh sách User</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Tên</th>
                                <th>Email</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userList.map(user => [
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <button
                                            className="btn btn-info btn-sm me-2"
                                            onClick={() => openDetail(user)}
                                        >
                                            {expandedUserId === user._id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm me-2"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                fetchUserHistory(user._id);
                                            }}
                                        >
                                            <i className="fas fa-history"></i> Lịch sử
                                        </button>
                                    </td>
                                </tr>,
                                expandedUserId === user._id && (
                                    <tr key={user._id + '-detail'}>
                                        <td colSpan={3}>
                                            <UserDetail user={user} />
                                        </td>
                                    </tr>
                                )
                            ])}
                        </tbody>
                    </table>
                </div>
                <div className="table-responsive" style={{ marginTop: 40 }}>
                    <h3>Danh sách Admin</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Tên</th>
                                <th>Email</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {adminList.map(user => [
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <button className="btn btn-info btn-sm" onClick={() => openDetail(user)}>
                                            {expandedUserId === user._id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                                        </button>
                                    </td>
                                </tr>,
                                expandedUserId === user._id && (
                                    <tr key={user._id + '-detail'}>
                                        <td colSpan={3}>
                                            <UserDetail user={user} />
                                        </td>
                                    </tr>
                                )
                            ])}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* History Modal */}
            {showModal && (
                <div className="history-modal-backdrop" onClick={closeHistoryModal}>
                    <div className="history-modal" onClick={e => e.stopPropagation()}>
                        <div className="history-modal-header">
                            <h4 className="history-modal-title">
                                Lịch sử chỉnh sửa - {selectedUser?.name}
                            </h4>
                            <button className="history-modal-close" onClick={closeHistoryModal}>
                                ×
                            </button>
                        </div>
                        {historyLoading ? (
                            <div className="text-center p-3">Đang tải...</div>
                        ) : (
                            <UserHistory history={userHistory} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default User; 