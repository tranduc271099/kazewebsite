import React from "react";

const Footer = () => (
  <footer id="footer" className="footer">
    <div className="footer-newsletter">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <h2>Join Our Newsletter</h2>
            <p>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <form action="forms/newsletter.php" method="post" className="php-email-form">
              <div className="newsletter-form d-flex">
                <input type="email" name="email" placeholder="Your email address" required="" />
                <button type="submit">Subscribe</button>
              </div>
              <div className="loading">Loading</div>
              <div className="error-message"></div>
              <div className="sent-message">Your subscription request has been sent. Thank you!</div>
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
                <span className="sitename">eStore</span>
              </a>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in nibh vehicula, facilisis magna ut, consectetur lorem.</p>
              <div className="footer-contact mt-4">
                <div className="contact-item">
                  <i className="bi bi-geo-alt"></i>
                  <span>123 Fashion Street, New York, NY 10001</span>
                </div>
                <div className="contact-item">
                  <i className="bi bi-telephone"></i>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="contact-item">
                  <i className="bi bi-envelope"></i>
                  <span>hello@example.com</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 col-sm-6">
            <div className="footer-widget">
              <h4>Shop</h4>
              <ul className="footer-links">
                <li><a href="category.html">New Arrivals</a></li>
                <li><a href="category.html">Bestsellers</a></li>
                <li><a href="category.html">Women's Clothing</a></li>
                <li><a href="category.html">Men's Clothing</a></li>
                <li><a href="category.html">Accessories</a></li>
                <li><a href="category.html">Sale</a></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 col-sm-6">
            <div className="footer-widget">
              <h4>Support</h4>
              <ul className="footer-links">
                <li><a href="support.html">Help Center</a></li>
                <li><a href="account.html">Order Status</a></li>
                <li><a href="shiping-info.html">Shipping Info</a></li>
                <li><a href="return-policy.html">Returns &amp; Exchanges</a></li>
                <li><a href="#">Size Guide</a></li>
                <li><a href="contact.html">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 col-sm-6">
            <div className="footer-widget">
              <h4>Company</h4>
              <ul className="footer-links">
                <li><a href="about.html">About Us</a></li>
                <li><a href="about.html">Careers</a></li>
                <li><a href="about.html">Press</a></li>
                <li><a href="about.html">Affiliates</a></li>
                <li><a href="about.html">Responsibility</a></li>
                <li><a href="about.html">Investors</a></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="footer-widget">
              <h4>Download Our App</h4>
              <p>Shop on the go with our mobile app</p>
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
                <h5>Follow Us</h5>
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
          <span>We Accept:</span>
          <div className="payment-icons">
            <i className="bi bi-credit-card" aria-label="Credit Card"></i>
            <i className="bi bi-paypal" aria-label="PayPal"></i>
            <i className="bi bi-apple" aria-label="Apple Pay"></i>
            <i className="bi bi-google" aria-label="Google Pay"></i>
            <i className="bi bi-shop" aria-label="Shop Pay"></i>
            <i className="bi bi-cash" aria-label="Cash on Delivery"></i>
          </div>
        </div>
        <div className="legal-links">
          <a href="tos.html">Terms of Service</a>
          <a href="privacy.html">Privacy Policy</a>
          <a href="tos.html">Cookies Settings</a>
        </div>
        <div className="copyright text-center">
          <p>© <span>Copyright</span> <strong className="sitename">eStore</strong>. All Rights Reserved.</p>
        </div>
        <div className="credits">
          Designed by <a href="https://bootstrapmade.com/">BootstrapMade</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer; 