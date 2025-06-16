import React from 'react';

const Widgets = () => (
    <div className="content-wrapper">
        {/* Content Header (Page header) */}
        <section className="content-header">
            <div className="container-fluid">
                <div className="row mb-2">
                    <div className="col-sm-6">
                        <h1>Widgets</h1>
                    </div>
                    <div className="col-sm-6">
                        <ol className="breadcrumb float-sm-right">
                            <li className="breadcrumb-item"><a href="#">Home</a></li>
                            <li className="breadcrumb-item active">Widgets</li>
                        </ol>
                    </div>
                </div>
            </div>
        </section>
        {/* Main content */}
        <section className="content">
            <div className="container-fluid">
                <h5 className="mb-2">Info Box</h5>
                <div className="row">
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box">
                            <span className="info-box-icon bg-info"><i className="far fa-envelope"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Messages</span>
                                <span className="info-box-number">1,410</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box">
                            <span className="info-box-icon bg-success"><i className="far fa-flag"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Bookmarks</span>
                                <span className="info-box-number">410</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box">
                            <span className="info-box-icon bg-warning"><i className="far fa-copy"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Uploads</span>
                                <span className="info-box-number">13,648</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box">
                            <span className="info-box-icon bg-danger"><i className="far fa-star"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Likes</span>
                                <span className="info-box-number">93,139</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Info Box With Custom Shadows */}
                <h5 className="mb-2">Info Box With Custom Shadows <small><i>Using Bootstrap's Shadow Utility</i></small></h5>
                <div className="row">
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box shadow-none">
                            <span className="info-box-icon bg-info"><i className="far fa-envelope"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Shadows</span>
                                <span className="info-box-number">None</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box shadow-sm">
                            <span className="info-box-icon bg-success"><i className="far fa-flag"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Shadows</span>
                                <span className="info-box-number">Small</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box shadow">
                            <span className="info-box-icon bg-warning"><i className="far fa-copy"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Shadows</span>
                                <span className="info-box-number">Regular</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box shadow-lg">
                            <span className="info-box-icon bg-danger"><i className="far fa-star"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Shadows</span>
                                <span className="info-box-number">Large</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Info Box With bg-* */}
                <h5 className="mt-4 mb-2">Info Box With <code>bg-*</code></h5>
                <div className="row">
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box bg-info">
                            <span className="info-box-icon"><i className="far fa-bookmark"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Bookmarks</span>
                                <span className="info-box-number">41,410</span>
                                <div className="progress">
                                    <div className="progress-bar" style={{ width: '70%' }}></div>
                                </div>
                                <span className="progress-description">
                                    70% Increase in 30 Days
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box bg-success">
                            <span className="info-box-icon"><i className="far fa-thumbs-up"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Likes</span>
                                <span className="info-box-number">41,410</span>
                                <div className="progress">
                                    <div className="progress-bar" style={{ width: '70%' }}></div>
                                </div>
                                <span className="progress-description">
                                    70% Increase in 30 Days
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
);

export default Widgets; 