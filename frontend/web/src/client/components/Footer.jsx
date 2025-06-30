import React from "react";

const Footer = () => (
  <footer id="footer" className="footer">
    <div className="footer-newsletter">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <h2>Đăng ký nhận bản tin</h2>
            <p>Đăng ký để nhận các ưu đãi đặc biệt, quà tặng miễn phí và các ưu đãi chỉ có một lần trong đời.</p>
            <form action="forms/newsletter.php" method="post" className="php-email-form">
              <div className="newsletter-form d-flex">
                <input type="email" name="email" placeholder="Địa chỉ email của bạn" required="" />
                <button type="submit">Đăng ký</button>
              </div>
              <div className="loading">Đang tải</div>
              <div className="error-message"></div>
              <div className="sent-message">Yêu cầu đăng ký của bạn đã được gửi. Cảm ơn bạn!</div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div className="footer-main">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-3 col-md-6 col-sm-12">
            <div className="footer-widget footer-about">
              <a href="index.html" className="logo">
                <span className="sitename">KazeStore</span>
              </a>
              <p>Cửa hàng thời trang chuyên cung cấp các sản phẩm chất lượng cao với giá cả hợp lý.</p>
              <div className="footer-contact mt-4">
                <div className="contact-item">
                  <i className="bi bi-geo-alt"></i>
                  <span>123 Đường Thời Trang, TP. Hồ Chí Minh</span>
                </div>
                <div className="contact-item">
                  <i className="bi bi-telephone"></i>
                  <span>+84 (123) 456-7890</span>
                </div>
                <div className="contact-item">
                  <i className="bi bi-envelope"></i>
                  <span>lienhe@kazestore.com</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 col-sm-6">
            <div className="footer-widget">
              <h4>Cửa hàng</h4>
              <ul className="footer-links">
                <li><a href="category.html">Hàng mới về</a></li>
                <li><a href="category.html">Bán chạy nhất</a></li>
                <li><a href="category.html">Thời trang nữ</a></li>
                <li><a href="category.html">Thời trang nam</a></li>
                <li><a href="category.html">Phụ kiện</a></li>
                <li><a href="category.html">Giảm giá</a></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 col-sm-6">
            <div className="footer-widget">
              <h4>Hỗ trợ</h4>
              <ul className="footer-links">
                <li><a href="support.html">Trung tâm trợ giúp</a></li>
                <li><a href="account.html">Tình trạng đơn hàng</a></li>
                <li><a href="shiping-info.html">Thông tin vận chuyển</a></li>
                <li><a href="return-policy.html">Chính sách đổi trả</a></li>
                <li><a href="#">Hướng dẫn chọn size</a></li>
                <li><a href="contact.html">Liên hệ chúng tôi</a></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 col-sm-6">
            <div className="footer-widget">
              <h4>Công ty</h4>
              <ul className="footer-links">
                <li><a href="about.html">Về chúng tôi</a></li>
                <li><a href="about.html">Tuyển dụng</a></li>
                <li><a href="about.html">Báo chí</a></li>
                <li><a href="about.html">Đối tác</a></li>
                <li><a href="about.html">Trách nhiệm</a></li>
                <li><a href="about.html">Nhà đầu tư</a></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="footer-widget">
              <h4>Tải ứng dụng</h4>
              <p>Mua sắm mọi lúc mọi nơi với ứng dụng di động của chúng tôi</p>
              <div className="app-buttons">
                <a href="#" className="app-btn">
                  <i className="bi bi-apple"></i>
                  <span>App Store</span>
                </a>
                <a href="#" className="app-btn">
                  <i className="bi bi-google-play"></i>
                  <span>Google Play</span>
                </a>
              </div>
              <div className="social-links mt-4">
                <h5>Theo dõi chúng tôi</h5>
                <div className="social-icons">
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
    <div className="footer-bottom">
      <div className="container">
        <div className="payment-methods d-flex align-items-center justify-content-center">
          <span>Chúng tôi chấp nhận:</span>
          <div className="payment-icons">
            <i className="bi bi-credit-card" aria-label="Thẻ tín dụng"></i>
            <i className="bi bi-paypal" aria-label="PayPal"></i>
            <i className="bi bi-apple" aria-label="Apple Pay"></i>
            <i className="bi bi-google" aria-label="Google Pay"></i>
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
          <p>© <span>Bản quyền</span> <strong className="sitename">KazeStore</strong>. Đã đăng ký bản quyền.</p>
        </div>
        <div className="credits">
          Thiết kế bởi <a href="https://bootstrapmade.com/">BootstrapMade</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer; 