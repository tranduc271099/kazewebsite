import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => (
    <div className="content-wrapper">
        <div className="content-header">
            <div className="container-fluid">
                <div className="row mb-2">
                    <div className="col-sm-6">
                        <h1 className="m-0">Dashboard</h1>
                    </div>
                    <div className="col-sm-6">
                        <ol className="breadcrumb float-sm-right">
                            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                            <li className="breadcrumb-item active">Dashboard</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
        <section className="content">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <ul>
                            <li><Link to="/dashboard/v1">Dashboard v1</Link></li>
                            <li><Link to="/dashboard/v2">Dashboard v2</Link></li>
                            <li><Link to="/dashboard/v3">Dashboard v3</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    </div>
);

export default Dashboard; 