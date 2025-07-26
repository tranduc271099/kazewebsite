import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Contact.css';

const Contact = () => {
    return (
        <main className="main">
            {/* Breadcrumb */}
            <div className="page-title light-background">
                <div className="container d-lg-flex justify-content-between align-items-center">
                    <h1 className="mb-2 mb-lg-0">Liên hệ</h1>
                    <nav className="breadcrumbs">
                        <ol>
                            <li><a href="/">Trang chủ</a></li>
                            <li className="current">Liên hệ</li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Contact Section */}
            <section className="contact-section section-padding">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8" data-aos="fade-right">
                            <div className="contact-form-wrapper">
                                <h2 className="section-title mb-4">Gửi tin nhắn cho chúng tôi</h2>
                                <form className="contact-form">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="name" className="form-label">Họ và tên *</label>
                                            <input type="text" className="form-control" id="name" required />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="email" className="form-label">Email *</label>
                                            <input type="email" className="form-control" id="email" required />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="phone" className="form-label">Số điện thoại</label>
                                        <input type="tel" className="form-control" id="phone" />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="subject" className="form-label">Chủ đề *</label>
                                        <select className="form-select" id="subject" required>
                                            <option value="">Chọn chủ đề</option>
                                            <option value="general">Thông tin chung</option>
                                            <option value="order">Đơn hàng</option>
                                            <option value="product">Sản phẩm</option>
                                            <option value="support">Hỗ trợ kỹ thuật</option>
                                            <option value="other">Khác</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="message" className="form-label">Nội dung tin nhắn *</label>
                                        <textarea className="form-control" id="message" rows="5" required></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary">
                                        <i className="bi bi-send"></i> Gửi tin nhắn
                                    </button>
                                </form>
                            </div>
                        </div>
                        
                        <div className="col-lg-4" data-aos="fade-left">
                            <div className="contact-info-wrapper">
                                <h2 className="section-title mb-4">Thông tin liên hệ</h2>
                                
                                <div className="contact-info-item mb-4">
                                    <div className="contact-icon">
                                        <i className="bi bi-geo-alt-fill"></i>
                                    </div>
                                    <div className="contact-details">
                                        <h5>Địa chỉ</h5>
                                        <p>123 Đường Thời Trang, Quận 1<br />TP. Hồ Chí Minh, Việt Nam</p>
                                    </div>
                                </div>
                                
                                <div className="contact-info-item mb-4">
                                    <div className="contact-icon">
                                        <i className="bi bi-telephone-fill"></i>
                                    </div>
                                    <div className="contact-details">
                                        <h5>Điện thoại</h5>
                                        <p>
                                            <a href="tel:+84123456789">+84 (123) 456-789</a><br />
                                            <a href="tel:+84987654321">+84 (987) 654-321</a>
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="contact-info-item mb-4">
                                    <div className="contact-icon">
                                        <i className="bi bi-envelope-fill"></i>
                                    </div>
                                    <div className="contact-details">
                                        <h5>Email</h5>
                                        <p>
                                            <a href="mailto:info@kazestore.com">info@kazestore.com</a><br />
                                            <a href="mailto:support@kazestore.com">support@kazestore.com</a>
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="contact-info-item mb-4">
                                    <div className="contact-icon">
                                        <i className="bi bi-clock-fill"></i>
                                    </div>
                                    <div className="contact-details">
                                        <h5>Giờ làm việc</h5>
                                        <p>
                                            Thứ 2 - Thứ 6: 8:00 - 18:00<br />
                                            Thứ 7: 8:00 - 17:00<br />
                                            Chủ nhật: 9:00 - 16:00
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="social-links">
                                    <h5 className="mb-3">Theo dõi chúng tôi</h5>
                                    <div className="social-icons">
                                        <a href="#" className="social-icon">
                                            <i className="bi bi-facebook"></i>
                                        </a>
                                        <a href="#" className="social-icon">
                                            <i className="bi bi-instagram"></i>
                                        </a>
                                        <a href="#" className="social-icon">
                                            <i className="bi bi-twitter"></i>
                                        </a>
                                        <a href="#" className="social-icon">
                                            <i className="bi bi-youtube"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="map-section">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="map-wrapper" style={{ height: '400px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="text-center">
                                    <i className="bi bi-map" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                                    <p className="mt-3 text-muted">Bản đồ sẽ được hiển thị ở đây</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Contact; 