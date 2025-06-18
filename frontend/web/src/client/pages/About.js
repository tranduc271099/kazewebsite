import React from "react";

const About = () => (
    <main className="main">
        {/* Page Title */}
        <div className="page-title light-background">
            <div className="container d-lg-flex justify-content-between align-items-center">
                <h1 className="mb-2 mb-lg-0">About</h1>
                <nav className="breadcrumbs">
                    <ol>
                        <li><a href="/">Home</a></li>
                        <li className="current">About</li>
                    </ol>
                </nav>
            </div>
        </div>
        {/* About 2 Section */}
        <section id="about-2" className="about-2 section">
            <div className="container" data-aos="fade-up" data-aos-delay="100">
                <span className="section-badge"><i className="bi bi-info-circle"></i> About Us</span>
                <div className="row">
                    <div className="col-lg-6">
                        <h2 className="about-title">Nemo enim ipsam voluptatem quia voluptas aspernatur</h2>
                        <p className="about-description">Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.</p>
                    </div>
                    <div className="col-lg-6">
                        <p className="about-text">Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.</p>
                        <p className="about-text">Amet eos ut. Officiis soluta ab id dolor non sint. Corporis omnis consequatur quisquam ex consequuntur quo omnis. Quo eligendi cum. Amet mollitia qui quidem dolores praesentium quasi ut et.</p>
                    </div>
                </div>
                <div className="row features-boxes gy-4 mt-3">
                    <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
                        <div className="feature-box">
                            <div className="icon-box"><i className="bi bi-bullseye"></i></div>
                            <h3><a href="#" className="stretched-link">At vero eos</a></h3>
                            <p>Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat.</p>
                        </div>
                    </div>
                    <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
                        <div className="feature-box">
                            <div className="icon-box"><i className="bi bi-person-check"></i></div>
                            <h3><a href="#" className="stretched-link">Sed ut perspiciatis</a></h3>
                            <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque.</p>
                        </div>
                    </div>
                    <div className="col-lg-4" data-aos="fade-up" data-aos-delay="400">
                        <div className="feature-box">
                            <div className="icon-box"><i className="bi bi-clipboard-data"></i></div>
                            <h3><a href="#" className="stretched-link">Nemo enim ipsam</a></h3>
                            <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam.</p>
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
                                <p>Nemo enim ipsam</p>
                            </div>
                            <div className="col-md-4" data-aos="fade-up" data-aos-delay="400">
                                <h2><span data-purecounter-start="0" data-purecounter-end="32" data-purecounter-duration="1" className="purecounter"></span>K</h2>
                                <p>Voluptatem sequi</p>
                            </div>
                            <div className="col-md-4" data-aos="fade-up" data-aos-delay="500">
                                <h2><span data-purecounter-start="0" data-purecounter-end="128" data-purecounter-duration="1" className="purecounter"></span>+</h2>
                                <p>Dolor sit consectetur</p>
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
                            <p>Implementing innovative strategies has revolutionized our approach to market challenges and competitive positioning.</p>
                            <div className="client-info">
                                <div className="client-image"><img src="/assets/img/person/person-f-7.webp" alt="Client" /></div>
                                <div className="client-details"><h3>Rachel Bennett</h3><span className="position">Strategy Director</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-item highlight" data-aos="fade-up" data-aos-delay="100">
                        <div className="testimonial-content">
                            <div className="quote-pattern"><i className="bi bi-quote"></i></div>
                            <p>Exceptional service delivery and innovative solutions have transformed our business operations, leading to remarkable growth and enhanced customer satisfaction across all touchpoints.</p>
                            <div className="client-info">
                                <div className="client-image"><img src="/assets/img/person/person-m-7.webp" alt="Client" /></div>
                                <div className="client-details"><h3>Daniel Morgan</h3><span className="position">Chief Innovation Officer</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-item" data-aos="fade-up" data-aos-delay="200">
                        <div className="testimonial-content">
                            <div className="quote-pattern"><i className="bi bi-quote"></i></div>
                            <p>Strategic partnership has enabled seamless digital transformation and operational excellence.</p>
                            <div className="client-info">
                                <div className="client-image"><img src="/assets/img/person/person-f-8.webp" alt="Client" /></div>
                                <div className="client-details"><h3>Emma Thompson</h3><span className="position">Digital Lead</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-item" data-aos="fade-up" data-aos-delay="300">
                        <div className="testimonial-content">
                            <div className="quote-pattern"><i className="bi bi-quote"></i></div>
                            <p>Professional expertise and dedication have significantly improved our project delivery timelines and quality metrics.</p>
                            <div className="client-info">
                                <div className="client-image"><img src="/assets/img/person/person-m-8.webp" alt="Client" /></div>
                                <div className="client-details"><h3>Christopher Lee</h3><span className="position">Technical Director</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-item highlight" data-aos="fade-up" data-aos-delay="400">
                        <div className="testimonial-content">
                            <div className="quote-pattern"><i className="bi bi-quote"></i></div>
                            <p>Collaborative approach and industry expertise have revolutionized our product development cycle, resulting in faster time-to-market and increased customer engagement levels.</p>
                            <div className="client-info">
                                <div className="client-image"><img src="/assets/img/person/person-f-9.webp" alt="Client" /></div>
                                <div className="client-details"><h3>Olivia Carter</h3><span className="position">Product Manager</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-item" data-aos="fade-up" data-aos-delay="500">
                        <div className="testimonial-content">
                            <div className="quote-pattern"><i className="bi bi-quote"></i></div>
                            <p>Innovative approach to user experience design has significantly enhanced our platform's engagement metrics and customer retention rates.</p>
                            <div className="client-info">
                                <div className="client-image"><img src="/assets/img/person/person-m-13.webp" alt="Client" /></div>
                                <div className="client-details"><h3>Nathan Brooks</h3><span className="position">UX Director</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>
);

export default About; 