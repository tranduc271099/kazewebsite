import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Content from './components/Content';
import Footer from './components/Footer';
import ControlSidebar from './components/ControlSidebar';
import Dashboard from './components/Dashboard';
import DashboardV1 from './components/DashboardV1';
import DashboardV2 from './components/DashboardV2';
import DashboardV3 from './components/DashboardV3';
import './App.css';
import Login from './LoginPage/Login';
import Register from './RegisterPage/Register';

function AnimatedRoutes() {
  const location = useLocation();
  const nodeRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {loading && (
        <div className="route-loading-overlay">
          Tab is loading <span className="fa fa-sync fa-spin" style={{ marginLeft: 8 }}></span>
        </div>
      )}
      <TransitionGroup>
        <CSSTransition key={location.pathname} classNames="fade" timeout={400} nodeRef={nodeRef}>
          <div ref={nodeRef}>
            <Routes location={location}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/v1" element={<DashboardV1 />} />
              <Route path="/dashboard/v2" element={<DashboardV2 />} />
              <Route path="/dashboard/v3" element={<DashboardV3 />} />
              <Route path="/" element={<DashboardV1 />} />
            </Routes>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </>
  );
}

function App() {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {isAuthRoute ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      ) : (
        <div className="wrapper">
          <Navbar />
          <Sidebar />
          <AnimatedRoutes />
          <Footer />
          <ControlSidebar />
        </div>
      )}
    </>
  );
}

export default App;
