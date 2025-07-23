import React from "react";

const InfoCardsSection = () => (
    <section id="info-cards" className="info-cards section light-background">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row g-4 justify-content-center">
                <div className="col-12 col-sm-6 col-lg-3" data-aos="fade-up" data-aos-delay="200">
                    <div className="info-card text-center">
                        <div className="icon-box">
                            <i className="bi bi-truck"></i>
                        </div>
                        <h3>Miễn phí vận chuyển</h3>
                        <p>Chúng tôi miễn phí vận chuyển cho tất cả các đơn hàng có giá trị từ 500.000đ trở lên trên toàn quốc.</p>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3" data-aos="fade-up" data-aos-delay="400">
                    <div className="info-card text-center">
                        <div className="icon-box">
                            <i className="bi bi-percent"></i>
                        </div>
                        <h3>Ưu đãi giảm giá</h3>
                        <p>Đăng ký thành viên để nhận ngay các mã giảm giá độc quyền và cập nhật những ưu đãi mới nhất.</p>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3" data-aos="fade-up" data-aos-delay="500">
                    <div className="info-card text-center">
                        <div className="icon-box">
                            <i className="bi bi-headset"></i>
                        </div>
                        <h3>Hỗ trợ 24/7</h3>
                        <p>Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn mọi lúc, mọi nơi.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default InfoCardsSection; 