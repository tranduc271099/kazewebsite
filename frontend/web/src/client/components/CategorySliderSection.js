import React from "react";

const CategorySliderSection = () => (
    <section id="category-cards" className="category-cards section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="category-slider swiper init-swiper">
                {/* Swiper config script sẽ được xử lý bởi main.js, giữ nguyên để hiệu ứng hoạt động */}
                <script type="application/json" className="swiper-config">
                    {`
            {
              "loop": true,
              "autoplay": {
                "delay": 5000,
                "disableOnInteraction": false
              },
              "grabCursor": true,
              "speed": 600,
              "slidesPerView": "auto",
              "spaceBetween": 20,
              "navigation": {
                "nextEl": ".swiper-button-next",
                "prevEl": ".swiper-button-prev"
              },
              "breakpoints": {
                "320": {"slidesPerView": 2, "spaceBetween": 15},
                "576": {"slidesPerView": 3, "spaceBetween": 15},
                "768": {"slidesPerView": 4, "spaceBetween": 20},
                "992": {"slidesPerView": 5, "spaceBetween": 20},
                "1200": {"slidesPerView": 6, "spaceBetween": 20}
              }
            }
          `}
                </script>
                <div className="swiper-wrapper">
                    <div className="swiper-slide">
                        <div className="category-card" data-aos="fade-up" data-aos-delay="100">
                            <div className="category-image">
                                <img src="/assets/img/product/product-1.webp" alt="Category" className="img-fluid" />
                            </div>
                            <h3 className="category-title">Vestibulum ante</h3>
                            <p className="category-count">4 Products</p>
                            <a href="ctaegory.html" className="stretched-link"></a>
                        </div>
                    </div>
                    <div className="swiper-slide">
                        <div className="category-card" data-aos="fade-up" data-aos-delay="200">
                            <div className="category-image">
                                <img src="/assets/img/product/product-6.webp" alt="Category" className="img-fluid" />
                            </div>
                            <h3 className="category-title">Maecenas nec</h3>
                            <p className="category-count">8 Products</p>
                            <a href="ctaegory.html" className="stretched-link"></a>
                        </div>
                    </div>
                    <div className="swiper-slide">
                        <div className="category-card" data-aos="fade-up" data-aos-delay="300">
                            <div className="category-image">
                                <img src="/assets/img/product/product-9.webp" alt="Category" className="img-fluid" />
                            </div>
                            <h3 className="category-title">Aenean tellus</h3>
                            <p className="category-count">4 Products</p>
                            <a href="ctaegory.html" className="stretched-link"></a>
                        </div>
                    </div>
                    <div className="swiper-slide">
                        <div className="category-card" data-aos="fade-up" data-aos-delay="400">
                            <div className="category-image">
                                <img src="/assets/img/product/product-f-1.webp" alt="Category" className="img-fluid" />
                            </div>
                            <h3 className="category-title">Donec quam</h3>
                            <p className="category-count">12 Products</p>
                            <a href="ctaegory.html" className="stretched-link"></a>
                        </div>
                    </div>
                    <div className="swiper-slide">
                        <div className="category-card" data-aos="fade-up" data-aos-delay="500">
                            <div className="category-image">
                                <img src="/assets/img/product/product-10.webp" alt="Category" className="img-fluid" />
                            </div>
                            <h3 className="category-title">Phasellus leo</h3>
                            <p className="category-count">4 Products</p>
                            <a href="ctaegory.html" className="stretched-link"></a>
                        </div>
                    </div>
                    <div className="swiper-slide">
                        <div className="category-card" data-aos="fade-up" data-aos-delay="600">
                            <div className="category-image">
                                <img src="/assets/img/product/product-m-1.webp" alt="Category" className="img-fluid" />
                            </div>
                            <h3 className="category-title">Quisque rutrum</h3>
                            <p className="category-count">2 Products</p>
                            <a href="ctaegory.html" className="stretched-link"></a>
                        </div>
                    </div>
                    <div className="swiper-slide">
                        <div className="category-card" data-aos="fade-up" data-aos-delay="700">
                            <div className="category-image">
                                <img src="/assets/img/product/product-10.webp" alt="Category" className="img-fluid" />
                            </div>
                            <h3 className="category-title">Etiam ultricies</h3>
                            <p className="category-count">4 Products</p>
                            <a href="ctaegory.html" className="stretched-link"></a>
                        </div>
                    </div>
                    <div className="swiper-slide">
                        <div className="category-card" data-aos="fade-up" data-aos-delay="800">
                            <div className="category-image">
                                <img src="/assets/img/product/product-2.webp" alt="Category" className="img-fluid" />
                            </div>
                            <h3 className="category-title">Fusce fermentum</h3>
                            <p className="category-count">4 Products</p>
                            <a href="ctaegory.html" className="stretched-link"></a>
                        </div>
                    </div>
                </div>
                <div className="swiper-button-next"></div>
                <div className="swiper-button-prev"></div>
            </div>
        </div>
    </section>
);

export default CategorySliderSection; 