import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";

import React from "react";
import User from "./pages/User";
import Category from "./pages/Category";
import Product from "./pages/Product";
import { UserProvider } from "./UserContext";
import ListOrder from "./pages/payment/ListOrder.jsx";
import Vouchers from "./pages/Vouchers.jsx"
import BannerManagement from "./pages/BannerManagement.jsx";
import ChatManagement from "./pages/ChatManagement.jsx";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to dashboard if at root admin path
  React.useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/dashboard') {
      navigate('/admin/dashboard');
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (theme.palette.mode === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [theme.palette.mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <UserProvider>
          <CssBaseline />
          <div className="app">
            <Sidebar isSidebar={isSidebar} />
            <main className="content">
              <Topbar setIsSidebar={setIsSidebar} />
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/user" element={<User />} />
                <Route path="/category" element={<Category />} />
                <Route path="/product" element={<Product />} />
                <Route path="/bill" element={<ListOrder />} />
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
              </Routes>
            </main>
          </div>
        </UserProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
