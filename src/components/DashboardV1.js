import React from 'react';

const DashboardV1 = () => (
    <div className="content-wrapper">
        {/* Content Header (Page header) */}
        <div className="content-header">
            <div className="container-fluid">
                <div className="row mb-2">
                    <div className="col-sm-6">
                        <h1 className="m-0">Dashboard</h1>
                    </div>
                    <div className="col-sm-6">
                        <ol className="breadcrumb float-sm-right">
                            <li className="breadcrumb-item"><a href="#">Home</a></li>
                            <li className="breadcrumb-item active">Dashboard v1</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
        {/* Main content */}
        <section className="content">
            <div className="container-fluid">
                {/* Small boxes (Stat box) */}
                <div className="row">
                    <div className="col-lg-3 col-6">
                        <div className="small-box bg-info">
                            <div className="inner">
                                <h3>150</h3>
                                <p>New Orders</p>
                            </div>
                            <div className="icon">
                                <i className="ion ion-bag"></i>
                            </div>
                            <a href="#" className="small-box-footer">More info <i className="fas fa-arrow-circle-right"></i></a>
                        </div>
                    </div>
                    <div className="col-lg-3 col-6">
                        <div className="small-box bg-success">
                            <div className="inner">
                                <h3>53<sup style={{ fontSize: '20px' }}>%</sup></h3>
                                <p>Bounce Rate</p>
                            </div>
                            <div className="icon">
                                <i className="ion ion-stats-bars"></i>
                            </div>
                            <a href="#" className="small-box-footer">More info <i className="fas fa-arrow-circle-right"></i></a>
                        </div>
                    </div>
                    <div className="col-lg-3 col-6">
                        <div className="small-box bg-warning">
                            <div className="inner">
                                <h3>44</h3>
                                <p>User Registrations</p>
                            </div>
                            <div className="icon">
                                <i className="ion ion-person-add"></i>
                            </div>
                            <a href="#" className="small-box-footer">More info <i className="fas fa-arrow-circle-right"></i></a>
                        </div>
                    </div>
                    <div className="col-lg-3 col-6">
                        <div className="small-box bg-danger">
                            <div className="inner">
                                <h3>65</h3>
                                <p>Unique Visitors</p>
                            </div>
                            <div className="icon">
                                <i className="ion ion-pie-graph"></i>
                            </div>
                            <a href="#" className="small-box-footer">More info <i className="fas fa-arrow-circle-right"></i></a>
                        </div>
                    </div>
                </div>
                {/* Main row */}
                <div className="row">
                    {/* Left col */}
                    <section className="col-lg-7 connectedSortable">
                        {/* Custom tabs (Charts with tabs)*/}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">
                                    <i className="fas fa-chart-pie mr-1"></i>
                                    Sales
                                </h3>
                                <div className="card-tools">
                                    <ul className="nav nav-pills ml-auto">
                                        <li className="nav-item">
                                            <a className="nav-link active" href="#revenue-chart" data-toggle="tab">Area</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" href="#sales-chart" data-toggle="tab">Donut</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="tab-content p-0">
                                    <div className="chart tab-pane active" id="revenue-chart" style={{ position: 'relative', height: '300px' }}>
                                        <canvas id="revenue-chart-canvas" height="300" style={{ height: '300px' }}></canvas>
                                    </div>
                                    <div className="chart tab-pane" id="sales-chart" style={{ position: 'relative', height: '300px' }}>
                                        <canvas id="sales-chart-canvas" height="300" style={{ height: '300px' }}></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* DIRECT CHAT */}
                        <div className="card direct-chat direct-chat-primary">
                            <div className="card-header">
                                <h3 className="card-title">Direct Chat</h3>
                                <div className="card-tools">
                                    <span title="3 New Messages" className="badge badge-primary">3</span>
                                    <button type="button" className="btn btn-tool" data-card-widget="collapse">
                                        <i className="fas fa-minus"></i>
                                    </button>
                                    <button type="button" className="btn btn-tool" title="Contacts" data-widget="chat-pane-toggle">
                                        <i className="fas fa-comments"></i>
                                    </button>
                                    <button type="button" className="btn btn-tool" data-card-widget="remove">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="direct-chat-messages">
                                    {/* ... (các message chat, bạn có thể copy tiếp nếu muốn đầy đủ) ... */}
                                </div>
                                <div className="direct-chat-contacts">
                                    {/* ... (các contact chat, bạn có thể copy tiếp nếu muốn đầy đủ) ... */}
                                </div>
                            </div>
                            <div className="card-footer">
                                <form action="#" method="post">
                                    <div className="input-group">
                                        <input type="text" name="message" placeholder="Type Message ..." className="form-control" />
                                        <span className="input-group-append">
                                            <button type="button" className="btn btn-primary">Send</button>
                                        </span>
                                    </div>
                                </form>
                            </div>
                        </div>
                        {/* TO DO List */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">
                                    <i className="ion ion-clipboard mr-1"></i>
                                    To Do List
                                </h3>
                                <div className="card-tools">
                                    <ul className="pagination pagination-sm">
                                        <li className="page-item"><a href="#" className="page-link">&laquo;</a></li>
                                        <li className="page-item"><a href="#" className="page-link">1</a></li>
                                        <li className="page-item"><a href="#" className="page-link">2</a></li>
                                        <li className="page-item"><a href="#" className="page-link">3</a></li>
                                        <li className="page-item"><a href="#" className="page-link">&raquo;</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="card-body">
                                <ul className="todo-list" data-widget="todo-list">
                                    <li>
                                        <span className="handle">
                                            <i className="fas fa-ellipsis-v"></i>
                                            <i className="fas fa-ellipsis-v"></i>
                                        </span>
                                        <div className="icheck-primary d-inline ml-2">
                                            <input type="checkbox" value="" name="todo1" id="todoCheck1" />
                                            <label htmlFor="todoCheck1"></label>
                                        </div>
                                        <span className="text">Design a nice theme</span>
                                        <small className="badge badge-danger"><i className="far fa-clock"></i> 2 mins</small>
                                        <div className="tools">
                                            <i className="fas fa-edit"></i>
                                            <i className="fas fa-trash-o"></i>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="card-footer clearfix">
                                <button type="button" className="btn btn-primary float-right"><i className="fas fa-plus"></i> Add item</button>
                            </div>
                        </div>
                    </section>
                    {/* Right col */}
                    <section className="col-lg-5 connectedSortable">
                        {/* Map card */}
                        <div className="card bg-gradient-primary">
                            <div className="card-header border-0">
                                <h3 className="card-title">
                                    <i className="fas fa-map-marker-alt mr-1"></i>
                                    Visitors
                                </h3>
                                <div className="card-tools">
                                    <button type="button" className="btn btn-primary btn-sm daterange" title="Date range">
                                        <i className="far fa-calendar-alt"></i>
                                    </button>
                                    <button type="button" className="btn btn-primary btn-sm" data-card-widget="collapse" title="Collapse">
                                        <i className="fas fa-minus"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                <div id="world-map" style={{ height: '250px', width: '100%' }}></div>
                            </div>
                            <div className="card-footer bg-transparent">
                                <div className="row">
                                    <div className="col-4 text-center">
                                        <div id="sparkline-1"></div>
                                        <div className="text-white">Visitors</div>
                                    </div>
                                    <div className="col-4 text-center">
                                        <div id="sparkline-2"></div>
                                        <div className="text-white">Online</div>
                                    </div>
                                    <div className="col-4 text-center">
                                        <div id="sparkline-3"></div>
                                        <div className="text-white">Sales</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* solid sales graph */}
                        <div className="card bg-gradient-info">
                            <div className="card-header border-0">
                                <h3 className="card-title">
                                    <i className="fas fa-th mr-1"></i>
                                    Sales Graph
                                </h3>
                                <div className="card-tools">
                                    <button type="button" className="btn bg-info btn-sm" data-card-widget="collapse">
                                        <i className="fas fa-minus"></i>
                                    </button>
                                    <button type="button" className="btn bg-info btn-sm" data-card-widget="remove">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                <canvas className="chart" id="line-chart" style={{ minHeight: '250px', height: '250px', maxHeight: '250px', width: '100%' }}></canvas>
                            </div>
                            <div className="card-footer bg-transparent">
                                <div className="row">
                                    <div className="col-4 text-center">
                                        <input type="text" className="knob" value="20" data-width="60" data-height="60" data-fgColor="#39CCCC" readOnly />
                                        <div className="text-white">Mail-Orders</div>
                                    </div>
                                    <div className="col-4 text-center">
                                        <input type="text" className="knob" value="50" data-width="60" data-height="60" data-fgColor="#39CCCC" readOnly />
                                        <div className="text-white">Online</div>
                                    </div>
                                    <div className="col-4 text-center">
                                        <input type="text" className="knob" value="30" data-width="60" data-height="60" data-fgColor="#39CCCC" readOnly />
                                        <div className="text-white">In-Store</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Calendar */}
                        <div className="card bg-gradient-success">
                            <div className="card-header border-0">
                                <h3 className="card-title">
                                    <i className="far fa-calendar-alt"></i>
                                    Calendar
                                </h3>
                                <div className="card-tools">
                                    <button type="button" className="btn btn-success btn-sm" data-card-widget="collapse">
                                        <i className="fas fa-minus"></i>
                                    </button>
                                    <button type="button" className="btn btn-success btn-sm" data-card-widget="remove">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="card-body pt-0">
                                <div id="calendar" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </section>
    </div>
);

export default DashboardV1; 