import React, { useEffect, useState } from "react";
import axios from "axios";

const CategorySliderSection = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/categories")
            .then(res => setCategories(res.data))
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        if (categories.length > 0 && window.initSwiper) {
            window.initSwiper();
        }
    }, [categories]);

    return (
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
                        {categories.map((cat, idx) => (
                            <div className="swiper-slide" key={cat._id}>
                                <div className="category-card" data-aos="fade-up" data-aos-delay={100 + idx * 100}>
                                    <div className="category-image">
                                        <img src={`http://localhost:5000${cat.image || "/assets/img/product/product-1.webp"}`} alt={cat.name} className="img-fluid" />
                                    </div>
                                    <h3 className="category-title">{cat.name}</h3>
                                    {/* <p className="category-count">{cat.productCount || 0} Products</p> */}
                                    <a href="#" className="stretched-link"></a>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="swiper-button-next"></div>
                    <div className="swiper-button-prev"></div>
                </div>
            </div>
        </section>
    );
};

export default CategorySliderSection; 