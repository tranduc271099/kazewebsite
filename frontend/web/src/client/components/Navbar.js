<<<<<<< HEAD
import React, { useState } from 'react';
=======
import React from 'react';
>>>>>>> 313c79ce51788a47d4d84ff060914c438e00c8ab
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import '../styles/Navbar.css';

const Header = styled.header`
  position: relative;
`;

const TopBar = styled.div`
  background-color: #f8f9fa;
  padding: 0.5rem 0;
  font-size: 0.9rem;
`;

const TopBarContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TopBarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  a {
    color: #333;
    &:hover {
      color: #0d6efd;
    }
  }
`;

const MainHeader = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
`;

const HeaderContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
`;

const SearchForm = styled.form`
  flex: 1;
  max-width: 500px;
  margin: 0 2rem;
  
  .input-group {
    display: flex;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
  }
  
  input {
    flex: 1;
    padding: 0.5rem 1rem;
    border: none;
    outline: none;
  }
  
  button {
    padding: 0.5rem 1rem;
    background: #333;
    color: white;
    border: none;
    cursor: pointer;
    
    &:hover {
      background: #444;
    }
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ActionButton = styled(Link)`
  position: relative;
  color: #333;
  font-size: 1.2rem;
  
  &:hover {
    color: #0d6efd;
  }
  
  .badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #0d6efd;
    color: white;
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
    border-radius: 50%;
  }
`;

const Nav = styled.nav`
  background: #333;
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const NavList = styled.ul`
  display: flex;
  gap: 2rem;
  
  a {
    color: white;
    padding: 1rem 0;
    display: block;
    
    &:hover {
      color: #0d6efd;
    }
    
    &.active {
      color: #0d6efd;
    }
  }
`;

const Navbar = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { items } = useSelector(state => state.cart);
  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);
<<<<<<< HEAD
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleUserMenuToggle = () => setUserMenuOpen(open => !open);
  const handleUserMenuClose = () => setUserMenuOpen(false);
=======
>>>>>>> 313c79ce51788a47d4d84ff060914c438e00c8ab

  return (
    <Header>
      <TopBar>
        <TopBarContainer>
          <TopBarItem>
            <i className="bi bi-telephone-fill"></i>
            <span>Need help? Call us: </span>
            <a href="tel:+1234567890">+123 456 7890</a>
          </TopBarItem>
          <TopBarItem>
            <span>Free shipping on orders over $50</span>
          </TopBarItem>
          <TopBarItem>
            <a href="#">USD</a>
            <span>|</span>
            <a href="#">English</a>
          </TopBarItem>
        </TopBarContainer>
      </TopBar>

      <MainHeader>
        <HeaderContainer>
          <Logo to="/">eStore</Logo>
          <SearchForm>
            <div className="input-group">
              <input type="text" placeholder="Search for products..." />
              <button type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </SearchForm>
          <HeaderActions>
<<<<<<< HEAD
            <div style={{ position: 'relative' }}>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', fontSize: '1.2rem' }}
                onClick={handleUserMenuToggle}
              >
                <i className="bi bi-person"></i>
              </button>
              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    background: '#fff',
                    borderRadius: 8,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    minWidth: 180,
                    zIndex: 1000,
                  }}
                  onMouseLeave={handleUserMenuClose}
                >
                  {isAuthenticated && user && user.role === 'admin' && (
                    <Link to="/admin" style={{ display: 'block', padding: '12px 16px', color: '#333', textDecoration: 'none' }} onClick={handleUserMenuClose}>
                      <i className="bi bi-speedometer2" style={{ marginRight: 8 }}></i> Admin
                    </Link>
                  )}
                  <Link to="/account" style={{ display: 'block', padding: '12px 16px', color: '#333', textDecoration: 'none' }} onClick={handleUserMenuClose}>
                    <i className="bi bi-person" style={{ marginRight: 8 }}></i> Thông tin cá nhân
                  </Link>
                  <button style={{ display: 'block', width: '100%', padding: '12px 16px', color: '#333', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }}>
                    <i className="bi bi-box-arrow-right" style={{ marginRight: 8 }}></i> Đăng xuất
                  </button>
                </div>
              )}
            </div>
=======
            <ActionButton to="/account">
              <i className="bi bi-person"></i>
            </ActionButton>
>>>>>>> 313c79ce51788a47d4d84ff060914c438e00c8ab
            <ActionButton to="/wishlist">
              <i className="bi bi-heart"></i>
              <span className="badge">0</span>
            </ActionButton>
            <ActionButton to="/cart">
              <i className="bi bi-cart3"></i>
              {cartItemsCount > 0 && (
                <span className="badge">{cartItemsCount}</span>
              )}
            </ActionButton>
          </HeaderActions>
        </HeaderContainer>
      </MainHeader>

      <Nav>
        <NavContainer>
          <NavList>
            <li><Link to="/" className="active">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/contact">Contact</Link></li>
<<<<<<< HEAD

=======
>>>>>>> 313c79ce51788a47d4d84ff060914c438e00c8ab
          </NavList>
        </NavContainer>
      </Nav>
    </Header>
  );
};

export default Navbar; 