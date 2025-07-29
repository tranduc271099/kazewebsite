import React from "react";

const Footer = () => (
  <footer id="footer" className="footer">
    <div className="footer-main">
      <div className="container">
        <div className="row justify-content-center gy-4">
          <div className="col-lg-6 col-md-8 col-sm-12">
            <div className="footer-widget footer-about text-center">
              <a href="index.html" className="logo mb-3 d-inline-block">
                <span className="sitename">KazeStore</span>
              </a>
              <p className="mb-4">Cửa hàng thời trang Kaze chuyên cung cấp các sản phẩm chất lượng cao với giá cả hợp lý.</p>
              <div className="footer-contact mt-3 mb-4 d-flex flex-column align-items-center gap-2">
                <div className="contact-item">
                  <i className="bi bi-geo-alt"></i>
                  <span>134A Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội</span>
                </div>
                <div className="contact-item">
                  <i className="bi bi-telephone"></i>
                  <span>+84 45268521</span>
                </div>
                <div className="contact-item">
                  <i className="bi bi-envelope"></i>
                  <span>kazeshop@gmail.com</span>
                </div>
              </div>
              <div className="social-links mt-4">
                <h5 className="mb-3">Theo dõi chúng tôi</h5>
                <div className="social-icons d-flex justify-content-center gap-3">
                  <a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
                  <a href="#" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
                  <a href="#" aria-label="Twitter"><i className="bi bi-twitter-x"></i></a>
                  <a href="#" aria-label="TikTok"><i className="bi bi-tiktok"></i></a>
                  <a href="#" aria-label="Pinterest"><i className="bi bi-pinterest"></i></a>
                  <a href="#" aria-label="YouTube"><i className="bi bi-youtube"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="footer-bottom mt-4">
      <div className="container">
        <div className="payment-methods d-flex align-items-center justify-content-center">
          <span>Chúng tôi chấp nhận:</span>
          <div className="payment-icons">
            <i className="bi bi-credit-card" aria-label="Thẻ tín dụng"></i>
            <i className="bi bi-shop" aria-label="Shop Pay"></i>
            <i className="bi bi-cash" aria-label="Thanh toán khi nhận hàng"></i>
          </div>
        </div>
        <div className="legal-links">
          <a href="tos.html">Điều khoản dịch vụ</a>
          <a href="privacy.html">Chính sách bảo mật</a>
          <a href="tos.html">Cài đặt cookie</a>
        </div>
        <div className="copyright text-center">
          <p>©2025 <span>Bản quyền</span> <strong className="sitename">KazeStore</strong>. Đã đăng ký bản quyền.</p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer; 