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
                        <p>Nulla sit morbi vestibulum eros duis amet, consectetur vitae lacus. Ut quis tempor felis sed nunc viverra.</p>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3" data-aos="fade-up" data-aos-delay="300">
                    <div className="info-card text-center">
                        <div className="icon-box">
                            <i className="bi bi-piggy-bank"></i>
                        </div>
                        <h3>Đảm bảo hoàn tiền</h3>
                        <p>Nullam gravida felis ac nunc tincidunt, sed malesuada justo pulvinar. Vestibulum nec diam vitae eros.</p>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3" data-aos="fade-up" data-aos-delay="400">
                    <div className="info-card text-center">
                        <div className="icon-box">
                            <i className="bi bi-percent"></i>
                        </div>
                        <h3>Ưu đãi giảm giá</h3>
                        <p>Nulla ipsum nisi vel adipiscing amet, dignissim consectetur ornare. Vestibulum quis posuere elit auctor.</p>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3" data-aos="fade-up" data-aos-delay="500">
                    <div className="info-card text-center">
                        <div className="icon-box">
                            <i className="bi bi-headset"></i>
                        </div>
                        <h3>Hỗ trợ 24/7</h3>
                        <p>Ipsum dolor amet sit consectetur adipiscing, nullam vitae euismod tempor nunc felis vestibulum ornare.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default InfoCardsSection; 