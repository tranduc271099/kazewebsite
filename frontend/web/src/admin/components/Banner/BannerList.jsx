import React from 'react';

const BannerList = ({ banners, onEdit, onDelete }) => {
    return (
        <div className="banner-list-container">
            <table className="banner-table">
                <thead>
                    <tr>
                        <th>Hình ảnh</th>
                        <th>Tiêu đề</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {banners.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>Chưa có banner nào.</td>
                        </tr>
                    ) : (
                        banners.map(banner => (
                            <tr key={banner._id}>
                                <td>
                                    <img src={banner.imageUrl} alt={banner.title} className="banner-thumbnail" />
                                </td>
                                <td>{banner.title}</td>
                                <td>
                                    <span className={banner.isActive ? 'status-active' : 'status-inactive'}>
                                        {banner.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                                    </span>
                                </td>
                                <td>
                                    <button onClick={() => onEdit(banner)} className="btn-edit">Sửa</button>
                                    <button onClick={() => onDelete(banner)} className="btn-delete">Xóa</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default BannerList;