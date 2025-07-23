import React, { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Link } from "react-router-dom"; // Import Link

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
                    spaceBetween={32}
                    slidesPerView={6}
                    breakpoints={{
                        320: { slidesPerView: 2, spaceBetween: 16 },
                        576: { slidesPerView: 3, spaceBetween: 20 },
                        768: { slidesPerView: 4, spaceBetween: 24 },
                        992: { slidesPerView: 5, spaceBetween: 28 },
                        1200: { slidesPerView: 6, spaceBetween: 32 }
                    }}
                >
                    {categories.map((cat, idx) => (
                        <SwiperSlide key={cat._id}>
                            <Link to={`/category/${cat.name.toLowerCase()}`} style={{ textDecoration: 'none', color: 'inherit' }}> {/* Wrap with Link */}
                                <div
                                    className="category-card text-center h-100 d-flex flex-column align-items-center justify-content-center"
                                    style={{
                                        padding: '18px 8px',
                                        borderRadius: 16,
                                        background: '#fafbfc',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                                    }}
                                    data-aos="fade-up"
                                    data-aos-delay={100 + idx * 100}
                                >
                                    <div className="category-image mb-2">
                                        <img style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain' }} src={cat.image} alt={cat.name} className="img-fluid" />
                                    </div>
                                    <h3 className="category-title mb-1" style={{ fontSize: '1rem' }}>{cat.name}</h3>
                                    <p className="category-count mb-0" style={{ fontSize: '0.9rem', color: '#888' }}>{cat.productCount || 0} Sản phẩm</p>
                                </div>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default CategorySliderSection;