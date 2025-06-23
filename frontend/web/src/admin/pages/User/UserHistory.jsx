import React from 'react';
import moment from 'moment';
import 'moment/locale/vi';

const UserHistory = ({ history }) => {
    if (!history || history.length === 0) {
        return <div className="text-center p-3">Chưa có lịch sử chỉnh sửa</div>;
    }

    const formatValue = (key, value) => {
        if (key === 'isLocked') {
            return value ? 'Đã khóa' : 'Đã mở khóa';
        }
        return value;
    };

    const getChangeItemClass = (key, value) => {
        if (key === 'isLocked') {
            return value ? 'change-item locked' : 'change-item unlocked';
        }
        return 'change-item';
    };

    return (
        <div className="user-history">
            <div className="history-list">
                {history.map((record, index) => {
                    const changes = Object.entries(record.changes)
                        .filter(([_, value]) => value !== undefined)
                        .map(([key, value]) => ({
                            key,
                            label: {
                                name: 'Tên',
                                email: 'Email',
                                role: 'Vai trò',
                                isLocked: 'Trạng thái'
                            }[key],
                            value: formatValue(key, value)
                        }));

                    return (
                        <div key={index} className="history-item">
                            <div className="history-header">
                                <span className="history-time">
                                    {moment(record.updatedAt).format('DD/MM/YYYY HH:mm')}
                                </span>
                                <span className="history-editor">
                                    Chỉnh sửa bởi: {record.updatedBy?.name || 'N/A'}
                                </span>
                            </div>
                            <div className="history-changes">
                                {changes.map((change, i) => (
                                    <div
                                        key={i}
                                        className={getChangeItemClass(change.key, record.changes[change.key])}
                                    >
                                        {`${change.label}: ${change.value}`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UserHistory; 