import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from './client/context/CartContext';
import { UserProvider } from './client/context/UserContext';
import './admin/index.css'; // Import admin CSS
// import Navbar from './components/Navbar'; // Đã xóa Navbar

// Pages
import Home from './client/pages/Home';
import Products from './client/pages/Products';
import ProductDetail from './client/pages/ProductDetail';
import Cart from './client/components/Cart';
import Login from './client/pages/Login';
import Register from './client/pages/Register';
import About from './client/pages/About';
import ClientCategory from './client/pages/Category';
import Profile from './client/pages/Profile';
import ChangePassword from './client/pages/ChangePassword';
import BillUser from './client/pages/Bill/BillUserClient.tsx';

// Components
import Footer from './client/components/Footer';
import Header from './client/components/Header';
import AuthLayout from './client/components/AuthLayout';

// Admin App - New Dashboard
import AdminApp from './admin/App';
import Checkout from './client/pages/Checkout/checkout.tsx';

function App() {
  return (
    <CartProvider>
      <UserProvider>
        <Router>
          <ToastContainer position="top-right" autoClose={3000} />
          <div className="App">
            {/* <Navbar />  Đã xóa Navbar */}
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Main Routes */}
              <Route path="/" element={<><Header /><Home /><Footer /></>} />
              <Route path="/products" element={<><Header /><Products /><Footer /></>} />
              <Route path="/products/:id" element={<><Header /><ProductDetail /><Footer /></>} />
              <Route path="/product-details/:productId" element={<><Header /><ProductDetail /><Footer /></>} />
              <Route path="/cart" element={<><Header /><Cart /><Footer /></>} />
              <Route path="/about" element={<><Header /><About /><Footer /></>} />
              <Route path="/category" element={<><Header /><ClientCategory /><Footer /></>} />
              <Route path="/profile" element={<><Header /><Profile /><Footer /></>} />
              <Route path="/change-password" element={<><Header /><ChangePassword /><Footer /></>} />
              <Route path="/bill" element={<><Header /><BillUser /><Footer /></>} />
              <Route path="/checkout" element={<><Header /><Checkout /><Footer /></>} />


              {/* Admin Routes - New Dashboard */}
              <Route path="/admin/*" element={<AdminApp />} />
              <Route path="/dashboard/*" element={<AdminApp />} />
            </Routes>
          </div>
        </Router>
      </UserProvider>
    </CartProvider>
  );
}

export default App;
