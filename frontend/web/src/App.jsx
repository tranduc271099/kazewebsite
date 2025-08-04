import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from './client/context/CartContext';
import { UserProvider } from './client/context/UserContext';
import './admin/index.css'; // Import admin CSS
import Chat from './client/components/Chat.jsx';
import ClientRealTimeSync from './client/components/ClientRealTimeSync.jsx';
import Home from './client/pages/Home';
import Products from './client/pages/Products';
import ProductDetail from './client/pages/ProductDetail';
import Cart from './client/components/Cart';
import Login from './client/pages/Login';
import Register from './client/pages/Register';
import ForgotPassword from './client/pages/ForgotPassword';
import ResetPassword from './client/pages/ResetPassword';
import About from './client/pages/About';
import ClientCategory from './client/pages/Category';
import Profile from './client/pages/Profile';
import ChangePassword from './client/pages/ChangePassword';
import BillUser from './client/pages/Bill/BillUserClient.jsx';
import PaymentSuccess from './client/pages/PaymentSuccess';
import PaymentFailure from './client/pages/PaymentFailure';
import Checkout from './client/pages/Checkout/checkout.jsx';
import Footer from './client/components/Footer';
import Header from './client/components/Header';
import AuthLayout from './client/components/AuthLayout';
import ProtectedRoute from './client/components/ProtectedRoute'; // Import ProtectedRoute
import AdminRoute from './admin/components/AdminRoute'; // Import AdminRoute
import AdminApp from './admin/App';
import CategoryFilterBar from './client/components/CategoryFilterBar';
import Search from './client/pages/Search';

// Custom Scroll to Top component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Component để hiển thị Chat có điều kiện
function ConditionalChat() {
  const location = useLocation();

  // Không hiển thị chat trong admin panel
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard')) {
    return null;
  }

  return <Chat />;
}

function App() {
  return (
    <CartProvider>
      <UserProvider>
        <Router>
          <ClientRealTimeSync>
            <ScrollToTop /> {/* Add ScrollToTop component here */}
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="App">
              {/* <Navbar />  Đã xóa Navbar */}
              <Routes>
                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<><Header /><Profile /><Footer /></>} />
                  <Route path="/change-password" element={<><Header /><ChangePassword /><Footer /></>} />
                  <Route path="/bill" element={<><Header /><BillUser /><Footer /></>} />
                  <Route path="/checkout" element={<><Header /><Checkout /><Footer /></>} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/payment-failure" element={<PaymentFailure />} />
                </Route>

                {/* Admin Routes - Protected by AdminRoute */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin/*" element={<AdminApp />} />
                  <Route path="/dashboard/*" element={<AdminApp />} />
                </Route>

                {/* Main Routes */}
                <Route path="/" element={<><Header /><CategoryFilterBar /><Home /><Footer /></>} />
                <Route path="/products" element={<><Header /><CategoryFilterBar /><Products /><Footer /></>} />
                <Route path="/products/:id" element={<><Header /><CategoryFilterBar /><ProductDetail /><Footer /></>} />
                <Route path="/product-details/:productId" element={<><Header /><CategoryFilterBar /><ProductDetail /><Footer /></>} />
                <Route path="/cart" element={<><Header /><CategoryFilterBar /><Cart /><Footer /></>} />
                <Route path="/about" element={<><Header /><CategoryFilterBar /><About /><Footer /></>} />
                <Route path="/search" element={<><Header /><CategoryFilterBar /><Search /><Footer /></>} />
                <Route path="/category/:categoryName" element={<><Header /><CategoryFilterBar /><ClientCategory /><Footer /></>} /> {/* Modified route to accept categoryName parameter */}
                <Route path="/category" element={<><Header /><CategoryFilterBar /><ClientCategory /><Footer /></>} /> {/* Keep this for /category base path */}

              </Routes>
              <ConditionalChat />
            </div>
          </ClientRealTimeSync>
        </Router>
      </UserProvider>
    </CartProvider>
  );
}

export default App;
