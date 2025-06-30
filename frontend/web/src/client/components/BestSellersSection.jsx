import React from "react";
import { Link } from "react-router-dom";

const BestSellersSection = () => (
    <section id="best-sellers" className="best-sellers section">
        <div className="container section-title" data-aos="fade-up" style={{ padding: '28px 40px 28px' }}>
            <h2>Sản phẩm bán chạy</h2>
            {/* <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p> */}
        </div>
        <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row gy-4">
                {/* Product 1 */}
                <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="100">
                    <div className="product-card">
                        <div className="product-image">
                            <img src="/assets/img/product/product-1.webp" className="img-fluid default-image" alt="Sản phẩm" loading="lazy" />
                            <img src="/assets/img/product/product-1-variant.webp" className="img-fluid hover-image" alt="Sản phẩm hover" loading="lazy" />
                            <div className="product-tags">
                                <span className="badge bg-accent">Mới</span>
                            </div>
                            <div className="product-actions">
                                <button className="btn-wishlist" type="button" aria-label="Thêm vào danh sách yêu thích">
                                    <i className="bi bi-heart"></i>
                                </button>
                                <button className="btn-quickview" type="button" aria-label="Xem nhanh">
                                    <i className="bi bi-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div className="product-info">
                            <h3 className="product-title"><Link to="/product-details">Áo Khoác Bomber Da Lộn</Link></h3>
                            <div className="product-price">
                                <span className="current-price">2.250.000đ</span>
                            </div>
                            <div className="product-rating">
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-half"></i>
                                <span className="rating-count">(42 đánh giá)</span>
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
                            <img src="/assets/img/product/product-4.webp" className="img-fluid default-image" alt="Sản phẩm" loading="lazy" />
                            <img src="/assets/img/product/product-4-variant.webp" className="img-fluid hover-image" alt="Sản phẩm hover" loading="lazy" />
                            <div className="product-tags">
                                <span className="badge bg-sale">Giảm giá</span>
                            </div>
                            <div className="product-actions">
                                <button className="btn-wishlist" type="button" aria-label="Thêm vào danh sách yêu thích">
                                    <i className="bi bi-heart"></i>
                                </button>
                                <button className="btn-quickview" type="button" aria-label="Xem nhanh">
                                    <i className="bi bi-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div className="product-info">
                            <h3 className="product-title"><Link to="/product-details">Váy Maxi Hoa Nhí</Link></h3>
                            <div className="product-price">
                                <span className="current-price">1.625.000đ</span>
                                <span className="original-price">2.000.000đ</span>
                            </div>
                            <div className="product-rating">
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star"></i>
                                <span className="rating-count">(28 đánh giá)</span>
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
                            <img src="/assets/img/product/product-7.webp" className="img-fluid default-image" alt="Sản phẩm" loading="lazy" />
                            <img src="/assets/img/product/product-7-variant.webp" className="img-fluid hover-image" alt="Sản phẩm hover" loading="lazy" />
                            <div className="product-actions">
                                <button className="btn-wishlist" type="button" aria-label="Thêm vào danh sách yêu thích">
                                    <i className="bi bi-heart"></i>
                                </button>
                                <button className="btn-quickview" type="button" aria-label="Xem nhanh">
                                    <i className="bi bi-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div className="product-info">
                            <h3 className="product-title"><Link to="/product-details">Quần Jeans Dáng Rộng</Link></h3>
                            <div className="product-price">
                                <span className="current-price">2.975.000đ</span>
                            </div>
                            <div className="product-rating">
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <span className="rating-count">(56 đánh giá)</span>
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
                            <img src="/assets/img/product/product-12.webp" className="img-fluid default-image" alt="Sản phẩm" loading="lazy" />
                            <img src="/assets/img/product/product-12-variant.webp" className="img-fluid hover-image" alt="Sản phẩm hover" loading="lazy" />
                            <div className="product-tags">
                                <span className="badge bg-sold-out">Hết hàng</span>
                            </div>
                            <div className="product-actions">
                                <button className="btn-wishlist" type="button" aria-label="Thêm vào danh sách yêu thích">
                                    <i className="bi bi-heart"></i>
                                </button>
                                <button className="btn-quickview" type="button" aria-label="Xem nhanh">
                                    <i className="bi bi-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div className="product-info">
                            <h3 className="product-title"><Link to="/product-details">Áo Sơ Mi Lụa Tay Dài</Link></h3>
                            <div className="product-price">
                                <span className="current-price">1.887.500đ</span>
                            </div>
                            <div className="product-rating">
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star"></i>
                                <i className="bi bi-star"></i>
                                <span className="rating-count">(15 đánh giá)</span>
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