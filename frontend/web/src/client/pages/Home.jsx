import React, { useEffect } from "react";
import HeroSection from "../components/HeroSection";
import InfoCardsSection from "../components/InfoCardsSection";
import CategorySliderSection from "../components/CategorySliderSection";
import BestSellersSection from "../components/BestSellersSection";
import ProductListSection from "../components/ProductListSection";
import "../styles/Home.css";
// import { useNavigate } from "react-router-dom"; // Comment out or remove if not needed

function Home() {
    // const navigate = useNavigate(); // Comment out or remove if not needed

    useEffect(() => {
        // Lấy token từ query param nếu có
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        if (tokenFromUrl) {
            localStorage.setItem('token', tokenFromUrl);
            // Xóa token khỏi URL để tránh lộ ra ngoài
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Loại bỏ logic chuyển hướng đến trang đăng nhập
        // const token = localStorage.getItem('token');
        // if (!token) {
        //     // Nếu không có token, chuyển hướng về trang đăng nhập
        //     navigate('/login');
        // }
        // Xử lý logic hiển thị nội dung cho người dùng
    }, []); // Removed navigate from dependency array as it's no longer used.

    return (
        <>
            {/* <Header /> */}
            <main className="main">
                <HeroSection />
                <InfoCardsSection />
                <CategorySliderSection />
                <BestSellersSection />
                <ProductListSection />
            </main>
        </>
    );
}

export default Home; 