import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/User.css';

const User = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [lockLoading, setLockLoading] = useState(false);
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

    const handleLock = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn khóa/mở khóa tài khoản này?')) return;
        try {
            setLockLoading(true);
            const token = localStorage.getItem('token');
            await axios.put(`/api/users/${id}/lock`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể khóa/mở khóa tài khoản');
        } finally {
            setLockLoading(false);
        }
    };

    const openDetail = (user) => {
        setExpandedUserId(expandedUserId === user._id ? null : user._id);
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
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userList.map(user => [
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td style={{ color: user.isLocked ? 'red' : 'green' }}>
                                        {user.isLocked ? 'Đã khóa' : 'Hoạt động'}
                                    </td>
                                    <td>
                                        <button className="btn btn-info btn-sm" onClick={() => openDetail(user)}>
                                            {expandedUserId === user._id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                                        </button>
                                        {currentUser?.role === 'admin' && (
                                            <button
                                                className="btn btn-warning btn-sm"
                                                style={{ marginLeft: 8 }}
                                                onClick={() => handleLock(user._id)}
                                                disabled={lockLoading}
                                            >
                                                {user.isLocked ? 'Mở khóa' : 'Khóa'}
                                            </button>
                                        )}
                                    </td>
                                </tr>,
                                expandedUserId === user._id && (
                                    <tr key={user._id + '-detail'}>
                                        <td colSpan={4}>
                                            <pre style={{ textAlign: 'left', background: '#222', color: '#fff', padding: 16, borderRadius: 8, margin: 0 }}>
                                                {JSON.stringify(user, null, 2)}
                                            </pre>
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
                                            <pre style={{ textAlign: 'left', background: '#222', color: '#fff', padding: 16, borderRadius: 8, margin: 0 }}>
                                                {JSON.stringify(user, null, 2)}
                                            </pre>
                                        </td>
                                    </tr>
                                )
                            ])}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default User; 