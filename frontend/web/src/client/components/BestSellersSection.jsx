import React from "react";
import { Link } from "react-router-dom";

const BestSellersSection = () => (
    <section id="best-sellers" className="best-sellers section">
        <div className="container section-title" data-aos="fade-up" style={{ padding: '28px 40px 28px' }}>
            <h2>Best Sellers</h2>
            {/* <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p> */}
        </div>
        <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row gy-4">
                {/* Product 1 */}
                <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="100">
                    <div className="product-card">
                        <div className="product-image">
                            <img src="/assets/img/product/product-1.webp" className="img-fluid default-image" alt="Product" loading="lazy" />
                            <img src="/assets/img/product/product-1-variant.webp" className="img-fluid hover-image" alt="Product hover" loading="lazy" />
                            <div className="product-tags">
                                <span className="badge bg-accent">New</span>
                            </div>
                            <div className="product-actions">
                                <button className="btn-wishlist" type="button" aria-label="Add to wishlist">
                                    <i className="bi bi-heart"></i>
                                </button>
                                <button className="btn-quickview" type="button" aria-label="Quick view">
                                    <i className="bi bi-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div className="product-info">
                            <h3 className="product-title"><Link to="/product-details">Lorem ipsum dolor sit amet</Link></h3>
                            <div className="product-price">
                                <span className="current-price">$89.99</span>
                            </div>
                            <div className="product-rating">
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-half"></i>
                                <span className="rating-count">(42)</span>
                            </div>
                            <button className="btn btn-add-to-cart">
                                <i className="bi bi-bag-plus me-2"></i>Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                </div>
                {/* Product 2 */}
                <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="150">
                    <div className="product-card">
                        <div className="product-image">
                            <img src="/assets/img/product/product-4.webp" className="img-fluid default-image" alt="Product" loading="lazy" />
                            <img src="/assets/img/product/product-4-variant.webp" className="img-fluid hover-image" alt="Product hover" loading="lazy" />
                            <div className="product-tags">
                                <span className="badge bg-sale">Sale</span>
                            </div>
                            <div className="product-actions">
                                <button className="btn-wishlist" type="button" aria-label="Add to wishlist">
                                    <i className="bi bi-heart"></i>
                                </button>
                                <button className="btn-quickview" type="button" aria-label="Quick view">
                                    <i className="bi bi-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div className="product-info">
                            <h3 className="product-title"><Link to="/product-details">Consectetur adipiscing elit</Link></h3>
                            <div className="product-price">
                                <span className="current-price">$64.99</span>
                                <span className="original-price">$79.99</span>
                            </div>
                            <div className="product-rating">
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star"></i>
                                <span className="rating-count">(28)</span>
                            </div>
                            <button className="btn btn-add-to-cart">
                                <i className="bi bi-bag-plus me-2"></i>Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                </div>
                {/* Product 3 */}
                <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="200">
                    <div className="product-card">
                        <div className="product-image">
                            <img src="/assets/img/product/product-7.webp" className="img-fluid default-image" alt="Product" loading="lazy" />
                            <img src="/assets/img/product/product-7-variant.webp" className="img-fluid hover-image" alt="Product hover" loading="lazy" />
                            <div className="product-actions">
                                <button className="btn-wishlist" type="button" aria-label="Add to wishlist">
                                    <i className="bi bi-heart"></i>
                                </button>
                                <button className="btn-quickview" type="button" aria-label="Quick view">
                                    <i className="bi bi-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div className="product-info">
                            <h3 className="product-title"><Link to="/product-details">Sed do eiusmod tempor incididunt</Link></h3>
                            <div className="product-price">
                                <span className="current-price">$119.00</span>
                            </div>
                            <div className="product-rating">
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <span className="rating-count">(56)</span>
                            </div>
                            <button className="btn btn-add-to-cart">
                                <i className="bi bi-bag-plus me-2"></i>Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                </div>
                {/* Product 4 */}
                <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="250">
                    <div className="product-card">
                        <div className="product-image">
                            <img src="/assets/img/product/product-12.webp" className="img-fluid default-image" alt="Product" loading="lazy" />
                            <img src="/assets/img/product/product-12-variant.webp" className="img-fluid hover-image" alt="Product hover" loading="lazy" />
                            <div className="product-tags">
                                <span className="badge bg-sold-out">Hết hàng</span>
                            </div>
                            <div className="product-actions">
                                <button className="btn-wishlist" type="button" aria-label="Add to wishlist">
                                    <i className="bi bi-heart"></i>
                                </button>
                                <button className="btn-quickview" type="button" aria-label="Quick view">
                                    <i className="bi bi-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div className="product-info">
                            <h3 className="product-title"><Link to="/product-details">Ut labore et dolore magna aliqua</Link></h3>
                            <div className="product-price">
                                <span className="current-price">$75.50</span>
                            </div>
                            <div className="product-rating">
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star"></i>
                                <i className="bi bi-star"></i>
                                <span className="rating-count">(15)</span>
                            </div>
                            <button className="btn btn-add-to-cart btn-disabled" disabled="">
                                <i className="bi bi-bag-plus me-2"></i>Hết hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default BestSellersSection; 