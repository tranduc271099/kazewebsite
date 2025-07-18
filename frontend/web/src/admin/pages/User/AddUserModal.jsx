import React from 'react';

const AddUserModal = ({ showAddModal, setShowAddModal, newUser, setNewUser, handleAddUser }) => {
    if (!showAddModal) return null;
    return (
        <div className="edit-modal">
            <div className="edit-modal-content">
                <h3>Thêm người dùng mới</h3>
                <form onSubmit={handleAddUser}>
                    <div className="form-group">
                        <label>Tên:</label>
                        <input
                            type="text"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu:</label>
                        <input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Vai trò:</label>
                        <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            className="form-control"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="modal-buttons">
                        <button type="submit" className="btn btn-success">Thêm</button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowAddModal(false)}
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal; 