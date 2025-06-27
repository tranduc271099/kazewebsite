import React, { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Autoplay } from 'swiper/modules';

const CategorySliderSection = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/categories")
            .then(res => setCategories(res.data))
            .catch(() => setCategories([]));
    }, []);

    return (
        <section id="category-cards" className="category-cards section">
            <div className="container" data-aos="fade-up" data-aos-delay="100">
                <Swiper
                    modules={[Navigation, Autoplay]}
                    navigation
                    loop
                    autoplay={{
                        delay: 2000,
                        disableOnInteraction: false
                    }}
                    spaceBetween={20}
                    slidesPerView={6}
                    breakpoints={{
                        320: { slidesPerView: 2, spaceBetween: 15 },
                        576: { slidesPerView: 3, spaceBetween: 15 },
                        768: { slidesPerView: 4, spaceBetween: 20 },
                        992: { slidesPerView: 5, spaceBetween: 20 },
                        1200: { slidesPerView: 6, spaceBetween: 20 }
                    }}
                >
                    {categories.map((cat, idx) => (
                        <SwiperSlide key={cat._id}>
                            <div className="category-card" data-aos="fade-up" data-aos-delay={100 + idx * 100}>
                                <div className="category-image">
                                    <img src={`http://localhost:5000${cat.image || "/assets/img/product/product-1.webp"}`} alt={cat.name} className="img-fluid" />
                                </div>
                                <h3 className="category-title">{cat.name}</h3>
                                {/* <p className="category-count">{cat.productCount || 0} Products</p> */}
                                <a href="#" className="stretched-link"></a>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default CategorySliderSection; 