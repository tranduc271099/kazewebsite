// Utility functions for formatting data

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

export const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
};

export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
};

export const formatDateTime = (date) => {
    return new Date(date).toLocaleString('vi-VN');
};

export const formatPercentage = (value, decimals = 2) => {
    return `${(value * 100).toFixed(decimals)}%`;
};
