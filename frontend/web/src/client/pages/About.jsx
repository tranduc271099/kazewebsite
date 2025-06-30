import React from "react";

const About = () => (
    <main className="main">
        {/* Page Title */}
        <div className="page-title light-background">
            <div className="container d-lg-flex justify-content-between align-items-center">
                <h1 className="mb-2 mb-lg-0">Giới thiệu</h1>
                <nav className="breadcrumbs">
                    <ol>
                        <li><a href="/">Trang chủ</a></li>
                        <li className="current">Giới thiệu</li>
                    </ol>
                </nav>
            </div>
        </div>
        {/* About 2 Section */}
        <section id="about-2" className="about-2 section">
            <div className="container" data-aos="fade-up" data-aos-delay="100">
                <span className="section-badge"><i className="bi bi-info-circle"></i> Về chúng tôi</span>
                <div className="row">
                    <div className="col-lg-6">
                        <h2 className="about-title">Hành trình tạo nên phong cách của bạn</h2>
                        <p className="about-description">Tại KazeStore, chúng tôi tin rằng thời trang không chỉ là quần áo, mà còn là cách bạn thể hiện bản thân. Chúng tôi luôn nỗ lực để mang đến những sản phẩm chất lượng với thiết kế độc đáo.</p>
                    </div>
                    <div className="col-lg-6">
                        <p className="about-text">Mỗi sản phẩm đều được chúng tôi lựa chọn cẩn thận từ chất liệu đến kiểu dáng, đảm bảo sự thoải mái và tự tin cho người mặc. Sứ mệnh của chúng tôi là đồng hành cùng bạn trên con đường định hình phong cách cá nhân.</p>
                        <p className="about-text">Chúng tôi tự hào về đội ngũ nhân viên nhiệt huyết, luôn sẵn sàng tư vấn và hỗ trợ khách hàng. Hãy đến với KazeStore để trải nghiệm không gian mua sắm tuyệt vời và tìm thấy những món đồ ưng ý nhất.</p>
                    </div>
                </div>
                <div className="row features-boxes gy-4 mt-3">
                    <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
                        <div className="feature-box">
                            <div className="icon-box"><i className="bi bi-bullseye"></i></div>
                            <h3><a href="#" className="stretched-link">Sản phẩm chất lượng</a></h3>
                            <p>Chúng tôi cam kết mang đến những sản phẩm được làm từ chất liệu cao cấp, bền đẹp theo thời gian.</p>
                        </div>
                    </div>
                    <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
                        <div className="feature-box">
                            <div className="icon-box"><i className="bi bi-person-check"></i></div>
                            <h3><a href="#" className="stretched-link">Dịch vụ tận tâm</a></h3>
                            <p>Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn với thái độ chuyên nghiệp và thân thiện nhất.</p>
                        </div>
                    </div>
                    <div className="col-lg-4" data-aos="fade-up" data-aos-delay="400">
                        <div className="feature-box">
                            <div className="icon-box"><i className="bi bi-clipboard-data"></i></div>
                            <h3><a href="#" className="stretched-link">Giá cả hợp lý</a></h3>
                            <p>Chúng tôi tin rằng thời trang chất lượng cao không nhất thiết phải đi kèm với mức giá đắt đỏ.</p>
                        </div>
                    </div>
                </div>
                <div className="row mt-5">
                    <div className="col-lg-12" data-aos="zoom-in" data-aos-delay="200">
                        <div className="video-box">
                            <img src="/assets/img/about/about-wide-1.webp" className="img-fluid" alt="Video Thumbnail" />
                            <a href="https://www.youtube.com/watch?v=Y7f98aduVJ8" className="glightbox pulsating-play-btn"></a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        {/* Stats Section */}
        <section id="stats" className="stats section">
            <div className="container" data-aos="fade-up" data-aos-delay="100">
                <div className="row align-items-center">
                    <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
                        <div className="avatars d-flex align-items-center">
                            <img src="/assets/img/person/person-m-2.webp" alt="Avatar 1" className="rounded-circle" loading="lazy" />
                            <img src="/assets/img/person/person-m-3.webp" alt="Avatar 2" className="rounded-circle" loading="lazy" />
                            <img src="/assets/img/person/person-f-5.webp" alt="Avatar 3" className="rounded-circle" loading="lazy" />
                            <img src="/assets/img/person/person-m-5.webp" alt="Avatar 4" className="rounded-circle" loading="lazy" />
                        </div>
                    </div>
                    <div className="col-lg-8">
                        <div className="row counters">
                            <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
                                <h2><span data-purecounter-start="0" data-purecounter-end="185" data-purecounter-duration="1" className="purecounter"></span>+</h2>
                                <p>Mẫu thiết kế độc quyền</p>
                            </div>
                            <div className="col-md-4" data-aos="fade-up" data-aos-delay="400">
                                <h2><span data-purecounter-start="0" data-purecounter-end="32" data-purecounter-duration="1" className="purecounter"></span>K</h2>
                                <p>Khách hàng hài lòng</p>
                            </div>
                            <div className="col-md-4" data-aos="fade-up" data-aos-delay="500">
                                <h2><span data-purecounter-start="0" data-purecounter-end="128" data-purecounter-duration="1" className="purecounter"></span>+</h2>
                                <p>Đối tác thương hiệu</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        {/* Testimonials Section */}
        <section id="testimonials" className="testimonials section">
            <div className="container">
                <div className="testimonial-masonry">
                    <div className="testimonial-item" data-aos="fade-up">
                        <div className="testimonial-content">
                            <div className="quote-pattern"><i className="bi bi-quote"></i></div>
                            <p>Việc áp dụng các chiến lược đổi mới đã cách mạng hóa cách tiếp cận của chúng tôi đối với các thách thức thị trường.</p>
                            <div className="client-info">
                                <div className="client-image"><img src="/assets/img/person/person-f-7.webp" alt="Client" /></div>
                                <div className="client-details"><h3>An Nhiên</h3><span className="position">Giám đốc chiến lược</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-item highlight" data-aos="fade-up" data-aos-delay="100">
                        <div className="testimonial-content">
                            <div className="quote-pattern"><i className="bi bi-quote"></i></div>
                            <p>Dịch vụ vượt trội và các giải pháp sáng tạo đã làm thay đổi hoạt động kinh doanh của chúng tôi, mang lại sự tăng trưởng đáng kể.</p>
                            <div className="client-info">
                                <div className="client-image"><img src="/assets/img/person/person-m-7.webp" alt="Client" /></div>
                                <div className="client-details"><h3>Đức Minh</h3><span className="position">Giám đốc đổi mới</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-item" data-aos="fade-up" data-aos-delay="200">
                        <div className="testimonial-content">
                            <div className="quote-pattern"><i className="bi bi-quote"></i></div>
                            <p>Quan hệ đối tác chiến lược đã cho phép chuyển đổi số liền mạch và hoạt động xuất sắc.</p>
                            <div className="client-info">
                                <div className="client-image"><img src="/assets/img/person/person-f-8.webp" alt="Client" /></div>
                                <div className="client-details"><h3>Thu Trang</h3><span className="position">Trưởng phòng kỹ thuật số</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-item" data-aos="fade-up" data-aos-delay="300">
                        <div className="testimonial-content">
                            <div className="quote-pattern"><i className="bi bi-quote"></i></div>
                            <p>Chuyên môn và sự tận tâm đã cải thiện đáng kể tiến độ và chất lượng các dự án của chúng tôi.</p>
                            <div className="client-info">
                                <div className="client-image"><img src="/assets/img/person/person-m-8.webp" alt="Client" /></div>
                                <div className="client-details"><h3>Quốc Hùng</h3><span className="position">Giám đốc kỹ thuật</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-item highlight" data-aos="fade-up" data-aos-delay="400">
                        <div className="testimonial-content">
                            <div className="quote-pattern"><i className="bi bi-quote"></i></div>
                            <p>Cách tiếp cận hợp tác và chuyên môn trong ngành đã cách mạng hóa chu trình phát triển sản phẩm của chúng tôi.</p>
                            <div className="client-info">
                                <div className="client-image"><img src="/assets/img/person/person-f-9.webp" alt="Client" /></div>
                                <div className="client-details"><h3>Mai Phương</h3><span className="position">Quản lý sản phẩm</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-item" data-aos="fade-up" data-aos-delay="500">
                        <div className="testimonial-content">
                            <div className="quote-pattern"><i className="bi bi-quote"></i></div>
                            <p>Cách tiếp cận sáng tạo trong thiết kế trải nghiệm người dùng đã nâng cao đáng kể các chỉ số tương tác trên nền tảng của chúng tôi.</p>
                            <div className="client-info">
                                <div className="client-image"><img src="/assets/img/person/person-m-13.webp" alt="Client" /></div>
                                <div className="client-details"><h3>Gia Bảo</h3><span className="position">Giám đốc UX</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>
);

export default About; 