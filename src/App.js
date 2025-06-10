import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import CategoryList from './components/CategoryList';
import './App.css';

function AnimatedRoutes() {
  const location = useLocation();
  const nodeRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setLoading(false), 400); // thời gian trùng với hiệu ứng fade
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {loading && <div className="route-loading-overlay">Tab is loading <span className="fa fa-sync fa-spin" style={{ marginLeft: 8 }}></span></div>}
      <TransitionGroup>
        <CSSTransition key={location.pathname} classNames="fade" timeout={400} nodeRef={nodeRef}>
          <div ref={nodeRef}>
            <Routes location={location}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/v1" element={<DashboardV1 />} />
              <Route path="/dashboard/v2" element={<DashboardV2 />} />
              <Route path="/dashboard/v3" element={<DashboardV3 />} />
              <Route path="/" element={<DashboardV1 />} />
              <Route path="/categories" element={<CategoryList />} />
            </Routes>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="wrapper" style={{ display: 'flex' }}>
        <Sidebar />
        <div className="main-content" style={{ flex: 1, minHeight: '100vh', background: '#f4f6f9', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <AnimatedRoutes />
          <Footer />
        </div>
        <ControlSidebar />
      </div>
    </Router>
  );
}

export default App;
