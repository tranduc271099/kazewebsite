import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/UserManagement.css';
import { handleApiError } from '../../../client/context/CartContext';
import ListUser from './listUser';
import EditUserModal from './EditUserModal';
import AddUserModal from './AddUserModal';
import UserHistoryModal from './UserHistoryModal';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editHistory, setEditHistory] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedUserForHistory, setSelectedUserForHistory] = useState(null);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });

    useEffect(() => {
        fetchUsers();
        // Lấy thông tin user hiện tại
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userObj = JSON.parse(userStr);
                setCurrentUser(userObj);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/users/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (err) {
            setError('Không thể tải danh sách người dùng');
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/users/admin/users', newUser, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowAddModal(false);
            setNewUser({
                name: '',
                email: '',
                password: '',
                role: 'user'
            });
            fetchUsers();
        } catch (err) {
            setError('Không thể tạo người dùng mới');
            handleApiError(err);
        }
    };

    const handleEdit = (user) => {
        // Kiểm tra nếu user hiện tại là admin và đang cố gắng sửa một admin khác
        if (currentUser?.role === 'admin' && user.role === 'admin') {
            setError('Không thể chỉnh sửa tài khoản admin khác');
            return;
        }
        setEditingUser(user);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/users/admin/users/${editingUser._id}`,
                editingUser,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Lưu lịch sử chỉnh sửa
            const historyEntry = {
                userId: editingUser._id,
                updatedBy: currentUser?._id,
                updatedAt: new Date(),
                changes: {
                    name: editingUser.name,
                    email: editingUser.email,
                    role: editingUser.role
                }
            };

            setEditHistory([...editHistory, historyEntry]);
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            setError('Không thể cập nhật thông tin người dùng');
            handleApiError(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/users/admin/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchUsers();
            } catch (err) {
                setError('Không thể xóa người dùng');
                handleApiError(err);
            }
        }
    };

    const handleToggleLock = async (user) => {
        if (user.role !== 'user') return;
        try {
            const token = localStorage.getItem('token');
            const newLockedStatus = !user.isLocked;
            
            await axios.put(
                `http://localhost:5000/api/users/admin/users/${user._id}`,
                { ...user, isLocked: newLockedStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchUsers();
        } catch (err) {
            setError('Không thể cập nhật trạng thái khóa');
            handleApiError(err);
        }
    };

    const handleViewHistory = (user) => {
        setSelectedUserForHistory(user);
        setShowHistoryModal(true);
    };

    const handleCloseHistoryModal = () => {
        setShowHistoryModal(false);
        setSelectedUserForHistory(null);
    };

    if (loading) return <div>Đang tải...</div>;

    return (
        <div className="content-inner">
            <div className="user-management-container">
                <div className="user-management-header">
                    <h2>Quản lý tài khoản</h2>
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowAddModal(true)}
                    >
                        <i className="fas fa-user-plus me-1"></i>
                        Thêm người dùng mới
                    </button>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <ListUser
                    users={users}
                    currentUser={currentUser}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handleToggleLock={handleToggleLock}
                    handleViewHistory={handleViewHistory}
                    loading={loading}
                    error={error}
                />

                <EditUserModal
                    editingUser={editingUser}
                    setEditingUser={setEditingUser}
                    handleUpdate={handleUpdate}
                />
                <AddUserModal
                    showAddModal={showAddModal}
                    setShowAddModal={setShowAddModal}
                    newUser={newUser}
                    setNewUser={setNewUser}
                    handleAddUser={handleAddUser}
                />
                <UserHistoryModal
                    isOpen={showHistoryModal}
                    onClose={handleCloseHistoryModal}
                    userId={selectedUserForHistory?._id}
                    userName={selectedUserForHistory?.name}
                />
            </div>
        </div>
    );
};

export default UserManagement; 