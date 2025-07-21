import React, { useEffect, useState } from "react";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const HeroSection = () => {
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/banners/active")
            .then(res => setBanners(res.data))
            .catch(err => console.error("Lỗi lấy banner:", err));
    }, []);

    if (banners.length === 0) {
        return <div>Đang tải banner...</div>;
    }

    const settings = {
        dots: true,
        infinite: banners.length > 1,
        speed: 800, // tăng lên 800ms cho mượt
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: banners.length > 1,
        autoplaySpeed: 4000,
        arrows: banners.length > 1,
        cssEase: "cubic-bezier(0.4,0,0.2,1)", // thêm easing mượt
        pauseOnHover: true,
        pauseOnFocus: true,
    };

    return (
        <section className="ecommerce-hero-1 hero section" id="hero">
            <div className="container">
                {banners.length > 1 ? (
                    <Slider {...settings}>
                        {banners.map((banner) => (
                            <div key={banner._id} style={{ textAlign: "center" }}>
                                <img
                                    src={banner.imageUrl}
                                    alt="Banner"
                                    style={{
                                        width: "100%",
                                        height: "600px",
                                        objectFit: "cover",
                                        borderRadius: "12px"
                                    }}
                                />
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <div style={{ textAlign: "center" }}>
                        <img
                            src={banners[0].imageUrl}
                            alt="Banner"
                            style={{
                                width: "100%",
                                height: "600px",
                                objectFit: "cover",
                                borderRadius: "12px"
                            }}
                        />
                    </div>
                )}
            </div>
        </section>
    );
};

export default HeroSection;