import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Vnpay.css';

const Vnpay = () => {
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    orderId: '',
    amount: '',
    orderInfo: ''
  });

  // Tạo orderId ngẫu nhiên
  const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORDER_${timestamp}_${random}`;
  };

  // Tự động điền orderId khi component mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      orderId: generateOrderId()
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/vnpay/create-qrcode', formData);
      
      if (response.data.success) {
        setQrCodeData(response.data.data);
      } else {
        setError(response.data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Lỗi tạo QR code:', error);
      setError('Không thể kết nối đến server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeData?.qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeData.qrCodeUrl;
      link.download = `vnpay-qr-${formData.orderId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyUrl = () => {
    if (qrCodeData?.paymentUrl) {
      navigator.clipboard.writeText(qrCodeData.paymentUrl);
      alert('Đã sao chép URL thanh toán!');
    }
  };

  return (
    <div className="vnpay-container">
      <div className="vnpay-header">
        <h1>VNPAY QR Code Generator</h1>
        <p>Tạo QR code thanh toán VNPAY Sandbox</p>
      </div>

      <div className="vnpay-content">
        <div className="form-section">
          <h2>Thông tin thanh toán</h2>
          <form onSubmit={handleSubmit} className="vnpay-form">
            <div className="form-group">
              <label htmlFor="orderId">Mã đơn hàng:</label>
              <input
                type="text"
                id="orderId"
                name="orderId"
                value={formData.orderId}
                onChange={handleInputChange}
                required
                placeholder="Nhập mã đơn hàng"
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Số tiền (VND):</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                placeholder="Nhập số tiền"
                min="1000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="orderInfo">Thông tin đơn hàng:</label>
              <textarea
                id="orderInfo"
                name="orderInfo"
                value={formData.orderInfo}
                onChange={handleInputChange}
                required
                placeholder="Nhập thông tin đơn hàng"
                rows="3"
              />
            </div>

            <button 
              type="submit" 
              className="generate-btn"
              disabled={loading}
            >
              {loading ? 'Đang tạo QR code...' : 'Tạo QR Code'}
            </button>
          </form>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {qrCodeData && (
          <div className="qr-section">
            <h2>QR Code VNPAY</h2>
            <div className="qr-container">
              <div className="qr-code">
                <img 
                  src={qrCodeData.qrCodeUrl} 
                  alt="VNPAY QR Code"
                  className="qr-image"
                />
              </div>
              
              <div className="qr-info">
                <div className="info-item">
                  <strong>Mã đơn hàng:</strong>
                  <span>{qrCodeData.orderId}</span>
                </div>
                <div className="info-item">
                  <strong>Số tiền:</strong>
                  <span>{qrCodeData.amount.toLocaleString('vi-VN')} VND</span>
                </div>
                <div className="info-item">
                  <strong>Thông tin:</strong>
                  <span>{qrCodeData.orderInfo}</span>
                </div>
              </div>

              <div className="qr-actions">
                <button 
                  onClick={handleDownloadQR}
                  className="action-btn download-btn"
                >
                  📥 Tải QR Code
                </button>
                <button 
                  onClick={handleCopyUrl}
                  className="action-btn copy-btn"
                >
                  📋 Sao chép URL
                </button>
                <a 
                  href={qrCodeData.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn payment-btn"
                >
                  💳 Thanh toán ngay
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="vnpay-footer">
        <div className="sandbox-info">
          <h3>Thông tin Sandbox VNPAY</h3>
          <ul>
            <li><strong>TMN Code:</strong> 2QXU4J4H</li>
            <li><strong>Environment:</strong> Sandbox (Test)</li>
            <li><strong>URL:</strong> https://sandbox.vnpayment.vn</li>
            <li><strong>Lưu ý:</strong> Đây là môi trường test, không thực hiện giao dịch thật</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Vnpay;
