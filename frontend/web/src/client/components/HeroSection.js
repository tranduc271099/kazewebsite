import React from "react";

const HeroSection = () => (
    <section className="ecommerce-hero-1 hero section" id="hero">
        <div className="container">
            <div className="row align-items-center">
                <div className="col-lg-6 content-col" data-aos="fade-right" data-aos-delay="100">
                    <div className="content">
                        <span className="promo-badge">New Collection 2025</span>
                        <h1>Discover Stylish <span>Fashion</span> For Every Season</h1>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo. Vestibulum ante ipsum primis in faucibus.</p>
                        <div className="hero-cta">
                            <a href="#" className="btn btn-shop">Shop Now <i className="bi bi-arrow-right"></i></a>
                            <a href="#" className="btn btn-collection">View Collection</a>
                        </div>
                        <div className="hero-features">
                            <div className="feature-item">
                                <i className="bi bi-truck"></i>
                                <span>Free Shipping</span>
                            </div>
                            <div className="feature-item">
                                <i className="bi bi-shield-check"></i>
                                <span>Secure Payment</span>
                            </div>
                            <div className="feature-item">
                                <i className="bi bi-arrow-repeat"></i>
                                <span>Easy Returns</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6 image-col" data-aos="fade-left" data-aos-delay="200">
                    <div className="hero-image">
                        <img src="/assets/img/product/product-f-9.webp" alt="Fashion Product" className="main-product" loading="lazy" />
                        <div className="floating-product product-1" data-aos="fade-up" data-aos-delay="300">
                            <img src="/assets/img/product/product-4.webp" alt="Product 2" />
                            <div className="product-info">
                                <h4>Summer Collection</h4>
                                <span className="price">$89.99</span>
                            </div>
                        </div>
                        <div className="floating-product product-2" data-aos="fade-up" data-aos-delay="400">
                            <img src="/assets/img/product/product-3.webp" alt="Product 3" />
                            <div className="product-info">
                                <h4>Casual Wear</h4>
                                <span className="price">$59.99</span>
                            </div>
                        </div>
                        <div className="discount-badge" data-aos="zoom-in" data-aos-delay="500">
                            <span className="percent">30%</span>
                            <span className="text">OFF</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default HeroSection; 