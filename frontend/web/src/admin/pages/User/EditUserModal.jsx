import React from 'react';

const EditUserModal = ({ editingUser, setEditingUser, handleUpdate }) => {
    if (!editingUser) return null;
    return (
        <div className="edit-modal">
            <div className="edit-modal-content">
                <h3>Chỉnh sửa thông tin người dùng</h3>
                <form onSubmit={handleUpdate}>
                    <div className="form-group">
                        <label>Tên:</label>
                        <input
                            type="text"
                            value={editingUser.name}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={editingUser.email}
                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label>Vai trò:</label>
                        <select
                            value={editingUser.role}
                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                            className="form-control"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Giới tính:</label>
                        <select
                            value={editingUser.gender || ''}
                            onChange={(e) => setEditingUser({ ...editingUser, gender: e.target.value })}
                            className="form-control"
                        >
                            <option value="">Chọn giới tính</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Ngày sinh:</label>
                        <input
                            type="date"
                            value={editingUser.dob ? new Date(editingUser.dob).toISOString().split('T')[0] : ''}
                            onChange={(e) => setEditingUser({ ...editingUser, dob: e.target.value })}
                            className="form-control"
                        />
                    </div>
                    <div className="modal-buttons">
                        <button type="submit" className="btn btn-success">Lưu</button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setEditingUser(null)}
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal; 