import React from "react";

const HeroSection = () => (
    <section className="ecommerce-hero-1 hero section" id="hero">
        <div className="container">
            <div className="row align-items-center">
                <div className="col-lg-6 content-col" data-aos="fade-right" data-aos-delay="100">
                    <div className="content">
                        <span className="promo-badge">Bộ sưu tập mới 2025</span>
                        <h1>Khám phá Phong cách <span>Thời trang</span> Cho Mọi Mùa</h1>
                        <p>Chào mừng bạn đến với cửa hàng của chúng tôi. Nơi bạn có thể tìm thấy những bộ trang phục thời thượng và phong cách nhất, phù hợp với mọi cá tính và mọi mùa trong năm.</p>
                        <div className="hero-cta">
                            <a href="#" className="btn btn-shop">Mua ngay <i className="bi bi-arrow-right"></i></a>
                            <a href="#" className="btn btn-collection">Xem bộ sưu tập</a>
                        </div>
                        <div className="hero-features">
                            <div className="feature-item">
                                <i className="bi bi-truck"></i>
                                <span>Giao hàng miễn phí</span>
                            </div>
                            <div className="feature-item">
                                <i className="bi bi-shield-check"></i>
                                <span>Thanh toán an toàn</span>
                            </div>
                            <div className="feature-item">
                                <i className="bi bi-arrow-repeat"></i>
                                <span>Đổi trả dễ dàng</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6 image-col" data-aos="fade-left" data-aos-delay="200">
                    <div className="hero-image">
                        <img src="/assets/img/product/product-f-9.webp" alt="Sản phẩm thời trang" className="main-product" loading="lazy" />
                        <div className="floating-product product-1" data-aos="fade-up" data-aos-delay="300">
                            <img src="/assets/img/product/product-4.webp" alt="Product 2" />
                            <div className="product-info">
                                <h4>Bộ sưu tập Hè</h4>
                                <span className="price">2.250.000đ</span>
                            </div>
                        </div>
                        <div className="floating-product product-2" data-aos="fade-up" data-aos-delay="400">
                            <img src="/assets/img/product/product-3.webp" alt="Product 3" />
                            <div className="product-info">
                                <h4>Trang phục thường ngày</h4>
                                <span className="price">1.500.000đ</span>
                            </div>
                        </div>
                        <div className="discount-badge" data-aos="zoom-in" data-aos-delay="500">
                            <span className="percent">30%</span>
                            <span className="text">GIẢM</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default HeroSection; 