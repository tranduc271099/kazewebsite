import { useState, useEffect } from "react";
import { Toaster } from 'react-hot-toast';
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { useMode } from "./theme";

import React from "react";
import User from "./pages/User";
import Category from "./pages/Category";
import ProductList from "./pages/ProductList";
import ProductAdd from "./pages/ProductAdd";
import { UserProvider } from "./UserContext";
import ListOrder from "./pages/payment/ListOrder.jsx";
import Vouchers from "./pages/Vouchers.jsx";
import BannerManagement from "./pages/BannerManagement.jsx";
import ChatManagement from "./pages/ChatManagement.jsx";
import ProductView from "./pages/ProductView";
import ListCustomer from "./pages/User/ListCustomer.jsx"; // Import ListCustomer
import ListStaff from "./pages/User/ListStaff.jsx";       // Import ListStaff
// import UserDetail from "./pages/User/UserDetail.jsx"; // Placeholder for user detail page
// import UserEdit from "./pages/User/UserEdit.jsx";       // Placeholder for user edit page
import UserDetail from "./pages/User/UserDetail.jsx"; // Placeholder for user detail page
import ListComment from "./pages/Comment/ListComment.jsx"; // Import ListComment
import ProfileScene from "./scenes/profile"; // Import ProfileScene

function App() {
  const [theme] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to dashboard if at root admin path
  React.useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/dashboard') {
      navigate('/admin/dashboard');
    }
  }, [location.pathname, navigate]);

  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <CssBaseline />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <div className="app">
          <Sidebar isSidebar={isSidebar} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfileScene />} />
              <Route path="/user" element={<User />} />
              <Route path="/category" element={<Category />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/add" element={<ProductAdd />} />
              <Route path="/products/edit/:productId" element={<ProductAdd />} />
              <Route path="/products/view/:productId" element={<ProductView />} />
              <Route path="/bill" element={<ListOrder />} />
              <Route path="/users/customers" element={<ListCustomer />} /> {/* New Customer List Route */}
              <Route path="/users/staffs" element={<ListStaff />} />       {/* New Staff List Route */}
              {/* User detail and edit routes */}
              <Route path="/users/view/:userId" element={<UserDetail />} /> {/* Use UserDetail component */}
              <Route path="/users/edit/:userId" element={<div>User Edit Page Placeholder</div>} />
              <Route path="/team" element={<Team />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/invoices" element={<Invoices />} />
              {/* <Route path="/form" element={<Form />} />
              <Route path="/bar" element={<Bar />} />
              <Route path="/pie" element={<Pie />} />
              <Route path="/line" element={<Line />} />
              <Route path="/faq" element={<FAQ />} /> */}
              <Route path="/voucher" element={<Vouchers />} />
              <Route path="/banners" element={<BannerManagement />} />
              <Route path="/chat-management" element={<ChatManagement />} />
              <Route path="/comments" element={<ListComment />} />
            </Routes>
          </main>
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
