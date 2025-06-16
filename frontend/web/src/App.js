import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from './client/context/CartContext';
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

// Components
import Footer from './client/components/Footer';
import Header from './client/components/Header';
import AuthLayout from './client/components/AuthLayout';

// Admin Pages
import AdminCategory from './admin/pages/Category';
import AdminOrder from './admin/pages/Order';
import AdminProduct from './admin/pages/Product';
// import AdminUser from './admin/pages/User';
import UserManagement from './admin/User/UserManagement';
import VoucherManagement from './admin/Voucher/VoucherManagement';

// Admin Components
import AdminLayout from './admin/components/Layout';
import AdminDashboardV1 from './admin/components/DashboardV1';

function App() {
  return (
    <CartProvider>
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
            <Route path="/" element={
              <>
                <Header />
                <Home />
                <Footer />
              </>
            } />
            <Route path="/products" element={
              <>
                <Header />
                <Products />
                <Footer />
              </>
            } />
            <Route path="/products/:id" element={
              <>
                <Header />
                <ProductDetail />
                <Footer />
              </>
            } />
            <Route path="/product-details/:productId" element={
              <>
                <Header />
                <ProductDetail />
                <Footer />
              </>
            } />
            <Route path="/cart" element={
              <>
                <Header />
                <Cart />
                <Footer />
              </>
            } />
            <Route path="/about" element={
              <>
                <Header />
                <About />
                <Footer />
              </>
            } />
            <Route path="/categories" element={
              <>
                <Header />
                <ClientCategory />
                <Footer />
              </>
            } />
            <Route path="/profile" element={
              <>
                <Header />
                <Profile />
                <Footer />
              </>
            } />

            {/* Admin Routes */}
            <Route path="/dashboard" element={<AdminLayout />}>
              <Route index element={<AdminDashboardV1 />} />
              <Route path="categories" element={<AdminCategory />} />
              <Route path="orders" element={<AdminOrder />} />
              <Route path="products" element={<AdminProduct />} />
              {/* <Route path="users" element={<AdminUser />} /> */}
              <Route path="user-management" element={<UserManagement />} />
              <Route path="vouchers" element={<VoucherManagement />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
