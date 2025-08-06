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
                            <img src="https://caodang.fpt.edu.vn/wp-content/uploads/FPT_Polytechnic_Hanoi.jpg" className="img-fluid" alt="Video Thumbnail" />

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
                            <img src="https://scontent.fhan14-3.fna.fbcdn.net/v/t39.30808-6/494269183_698422712571591_2429022437792924518_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeE_IiAgwuhhqEOGwuAU2SFahAf9VbiMzPCEB_1VuIzM8HWEJZ63obKwZIKGwrc29rrQwTTF8L6HWLZmZAiCux2r&_nc_ohc=ZZARozfUdxoQ7kNvwHFi_w9&_nc_oc=AdkTu6ICvbpskvwINHDS65FTElM3CZ8aPRqMKBQaogTTFokqLOThAZhqSt-zq8PtdCEdkXa75K9DHZiIkx7rKiJG&_nc_zt=23&_nc_ht=scontent.fhan14-3.fna&_nc_gid=2oyPoUQbnHhH3i2ONrC0pw&oh=00_AfXPPnov8Li-S33a38tYX5CrZasQRgX1f2gPwucfx7wz0g&oe=68992799" alt="Avatar 1" className="rounded-circle" loading="lazy" />
                            <img src="https://scontent-hkg1-2.xx.fbcdn.net/v/t39.30808-6/485109838_1982356488956429_4899577137172592131_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHAUJKvmTUbVbQs1rD2WOpPfDo2xfve1418OjbF-97XjQ4tamqKYOEWOi__wPFMVeQ0ULrqbH0gXENJ8wo_65t_&_nc_ohc=U_DNnGB4NG4Q7kNvwHfxMov&_nc_oc=Adkv1lPEyLjuzl9Ps3x_3vqLScx42q2A4GIsXzuFR65EOH-H1vBZQM1ckBdlpDbvFmAC1DDpnWCdvIwLyw-BKNH-&_nc_zt=23&_nc_ht=scontent-hkg1-2.xx&_nc_gid=ttQG6TIAIcqQDZrHocOxpw&oh=00_AfXgq0n1xO-Vcqk4qSW0YOxmaZVaxelvsTuZLp1ZTnJD4w&oe=68993360" alt="Avatar 2" className="rounded-circle" loading="lazy" />
                            <img src="https://scontent.fhan14-5.fna.fbcdn.net/v/t39.30808-6/528299863_771405115273350_4393273247041755186_n.jpg?stp=dst-jpg_p526x296_tt6&_nc_cat=104&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEyShyMhrK6OLMMX-a35pqve2anDtYjfgR7ZqcO1iN-BBzwbKVniIsNLBFZI47JL5d80JfUlqvKvBBmyXZlb-qh&_nc_ohc=MfWekOQOljAQ7kNvwE6NL45&_nc_oc=AdlPPGVr-uguwvUpPeLXWbcz1IynqTiX0X2yMsEjTv9a_xKmVtSIfUgoqgfWPeUCoiFqvR0xaj8v7sY3wL8X2b6U&_nc_zt=23&_nc_ht=scontent.fhan14-5.fna&_nc_gid=FQld8bKZCyblody31Ze35Q&oh=00_AfXVMMwbfBZ4gTj7uwpfnu9cnmiPGUgJ-keYgEuFGUS17Q&oe=68994D1A" alt="Avatar 3" className="rounded-circle" loading="lazy" />
                            <img src="https://scontent.fhan14-5.fna.fbcdn.net/v/t39.30808-6/529633710_771411775272684_8079865008318487294_n.jpg?stp=dst-jpg_p526x296_tt6&_nc_cat=106&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGe8N2JW4-xg2muRCihrE7DecZlde2nT1Z5xmV17adPVpXJsZP9oAcO4i-EKdLx80c3exsS5uSiJcevPW1VWZ8j&_nc_ohc=Lv-wAkAJuH4Q7kNvwFrdytt&_nc_oc=AdnEbgga5gU1Y3r3ImpJppwdgh_uOn9LZwXrCd3igP_zeEY4cdSVZAJkU8cw2yoLs9Lh2jZqQG5mSxwEugchrnVO&_nc_zt=23&_nc_ht=scontent.fhan14-5.fna&_nc_gid=jjyQi5FcscdM3NzXrDjLRQ&oh=00_AfUUoxnuC_42QZo6oJgW33JVrLqfxK0QOj7KLCCGp4Nmwg&oe=68993267" alt="Avatar 4" className="rounded-circle" loading="lazy" />
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
                                <div className="client-image"><img src="https://scontent.fhan14-3.fna.fbcdn.net/v/t39.30808-6/494269183_698422712571591_2429022437792924518_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeE_IiAgwuhhqEOGwuAU2SFahAf9VbiMzPCEB_1VuIzM8HWEJZ63obKwZIKGwrc29rrQwTTF8L6HWLZmZAiCux2r&_nc_ohc=ZZARozfUdxoQ7kNvwHFi_w9&_nc_oc=AdkTu6ICvbpskvwINHDS65FTElM3CZ8aPRqMKBQaogTTFokqLOThAZhqSt-zq8PtdCEdkXa75K9DHZiIkx7rKiJG&_nc_zt=23&_nc_ht=scontent.fhan14-3.fna&_nc_gid=2oyPoUQbnHhH3i2ONrC0pw&oh=00_AfXPPnov8Li-S33a38tYX5CrZasQRgX1f2gPwucfx7wz0g&oe=68992799" alt="Client" /></div>
                                <div className="client-details"><h3>Trần Minh Đức</h3><span className="position">ductmph46730@fpt.edu.vn</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-item highlight" data-aos="fade-up" data-aos-delay="100">
                        <div className="testimonial-content">
                            <div className="quote-pattern"><i className="bi bi-quote"></i></div>
                            <p>Dịch vụ vượt trội và các giải pháp sáng tạo đã làm thay đổi hoạt động kinh doanh của chúng tôi, mang lại sự tăng trưởng đáng kể.</p>
                            <div className="client-info">
                                <div className="client-image"><img src="https://scontent-hkg1-2.xx.fbcdn.net/v/t39.30808-6/485109838_1982356488956429_4899577137172592131_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHAUJKvmTUbVbQs1rD2WOpPfDo2xfve1418OjbF-97XjQ4tamqKYOEWOi__wPFMVeQ0ULrqbH0gXENJ8wo_65t_&_nc_ohc=U_DNnGB4NG4Q7kNvwHfxMov&_nc_oc=Adkv1lPEyLjuzl9Ps3x_3vqLScx42q2A4GIsXzuFR65EOH-H1vBZQM1ckBdlpDbvFmAC1DDpnWCdvIwLyw-BKNH-&_nc_zt=23&_nc_ht=scontent-hkg1-2.xx&_nc_gid=ttQG6TIAIcqQDZrHocOxpw&oh=00_AfXgq0n1xO-Vcqk4qSW0YOxmaZVaxelvsTuZLp1ZTnJD4w&oe=68993360" alt="Client" /></div>
                                <div className="client-details"><h3>Bùi Đức Đạt</h3><span className="position">datbdph45586@fpt.edu.vn</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-item" data-aos="fade-up" data-aos-delay="200">
                        <div className="testimonial-content">
                            <div className="quote-pattern"><i className="bi bi-quote"></i></div>
                            <p>Quan hệ đối tác chiến lược đã cho phép chuyển đổi số liền mạch và hoạt động xuất sắc.</p>
                            <div className="client-info">
                                <div className="client-image"><img src="https://scontent.fhan14-5.fna.fbcdn.net/v/t39.30808-6/528299863_771405115273350_4393273247041755186_n.jpg?stp=dst-jpg_p526x296_tt6&_nc_cat=104&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEyShyMhrK6OLMMX-a35pqve2anDtYjfgR7ZqcO1iN-BBzwbKVniIsNLBFZI47JL5d80JfUlqvKvBBmyXZlb-qh&_nc_ohc=MfWekOQOljAQ7kNvwE6NL45&_nc_oc=AdlPPGVr-uguwvUpPeLXWbcz1IynqTiX0X2yMsEjTv9a_xKmVtSIfUgoqgfWPeUCoiFqvR0xaj8v7sY3wL8X2b6U&_nc_zt=23&_nc_ht=scontent.fhan14-5.fna&_nc_gid=FQld8bKZCyblody31Ze35Q&oh=00_AfXVMMwbfBZ4gTj7uwpfnu9cnmiPGUgJ-keYgEuFGUS17Q&oe=68994D1A" alt="Client" /></div>
                                <div className="client-details"><h3>Nguyễn Văn Thành</h3><span className="position">thanhnvph46172@fpt.edu.vn</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-item" data-aos="fade-up" data-aos-delay="300">
                        <div className="testimonial-content">
                            <div className="quote-pattern"><i className="bi bi-quote"></i></div>
                            <p>Chuyên môn và sự tận tâm đã cải thiện đáng kể tiến độ và chất lượng các dự án của chúng tôi.</p>
                            <div className="client-info">
                                <div className="client-image"><img src="https://scontent.fhan14-5.fna.fbcdn.net/v/t39.30808-6/529633710_771411775272684_8079865008318487294_n.jpg?stp=dst-jpg_p526x296_tt6&_nc_cat=106&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGe8N2JW4-xg2muRCihrE7DecZlde2nT1Z5xmV17adPVpXJsZP9oAcO4i-EKdLx80c3exsS5uSiJcevPW1VWZ8j&_nc_ohc=Lv-wAkAJuH4Q7kNvwFrdytt&_nc_oc=AdnEbgga5gU1Y3r3ImpJppwdgh_uOn9LZwXrCd3igP_zeEY4cdSVZAJkU8cw2yoLs9Lh2jZqQG5mSxwEugchrnVO&_nc_zt=23&_nc_ht=scontent.fhan14-5.fna&_nc_gid=jjyQi5FcscdM3NzXrDjLRQ&oh=00_AfUUoxnuC_42QZo6oJgW33JVrLqfxK0QOj7KLCCGp4Nmwg&oe=68993267" alt="Client" /></div>
                                <div className="client-details"><h3>Nguyễn Trọng Đức Long</h3><span className="position">longntdph46774@fpt.edu.vn</span></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    </main>
);

export default About; 