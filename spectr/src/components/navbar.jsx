import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { CiUser, CiShoppingCart, CiHeart } from "react-icons/ci";

import "./navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  // Calculate cart and wishlist counts dynamically
  useEffect(() => {
    const updateCounts = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        if (storedUser.cart) {
          const count = storedUser.cart.reduce((acc, item) => acc + item.quantity, 0);
          setCartCount(count);
        } else {
          setCartCount(0);
        }
        if (storedUser.wishlist) {
          setWishlistCount(storedUser.wishlist.length);
        } else {
          setWishlistCount(0);
        }
      } else {
        setCartCount(0);
        setWishlistCount(0);
      }
    };

    updateCounts();

    // Listen for custom update events and local storage changes
    window.addEventListener("storage", updateCounts);
    window.addEventListener("cartUpdated", updateCounts);
    window.addEventListener("wishlistUpdated", updateCounts);

    return () => {
      window.removeEventListener("storage", updateCounts);
      window.removeEventListener("cartUpdated", updateCounts);
      window.removeEventListener("wishlistUpdated", updateCounts);
    };
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector('.home-snap-container');
      if (container) {
        setIsScrolled(container.scrollTop > 50);
      } else {
        setIsScrolled(window.scrollY > 50);
      }
    };

    // Listen to snap container scroll (homepage)
    const container = document.querySelector('.home-snap-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    
    // Listen to window scroll (other pages)
    window.addEventListener('scroll', handleScroll);

    // Initial check
    handleScroll();

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location]);

  const isHome = location.pathname === "/";
  const showBlurBg = isScrolled || !isHome;

  return (
    <div className={`navbar ${isHome ? "navbar-home" : "navbar-standard"} ${showBlurBg ? "navbar-scrolled" : ""}`}>
      {isHome ? (
        /* ===== HOME PAGE NAVBAR (Asymmetrical style for Hero) ===== */
        <nav className="nav-container nav-home-layout">
          <div className="nav-left-group">
            <NavLink to="/" className="logo">
              SPECT<span className="mirror">R</span>
            </NavLink>
            <div className="nav-menu-links">
              <NavLink to="/" end>HOME</NavLink>
              <NavLink to="/store">STORE</NavLink>
              <NavLink to="/about">ABOUT</NavLink>
            </div>
          </div>

          <div className="nav-right-actions">
            <NavLink to="/profile" title="Account">
              <CiUser className="nav-icon" />
            </NavLink>
            <NavLink to="/wishlist" title="Wishlist" className="nav-wishlist-link">
              <CiHeart className="nav-icon" />
              {wishlistCount > 0 && <span className="nav-wishlist-badge">{wishlistCount}</span>}
            </NavLink>
            <NavLink to="/cart" title="Cart" className="nav-cart-link">
              <CiShoppingCart className="nav-icon" />
              {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
            </NavLink>
            {!user && (
              <NavLink to="/login" className="nav-login-link">
                LOGIN
              </NavLink>
            )}
          </div>

          <div 
            className={`hamburger ${menuOpen ? "active" : ""}`} 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </nav>
      ) : (
        /* ===== STANDARD PAGE NAVBAR (Centered style, all black text) ===== */
        <nav className="nav-container nav-standard-layout">
          <NavLink to="/" className="logo">
            SPECT<span className="mirror">R</span>
          </NavLink>

          <div className="nav-menu-links">
            <NavLink to="/" end>HOME</NavLink>
            <NavLink to="/store">STORE</NavLink>
            <NavLink to="/about">ABOUT</NavLink>
          </div>

          <div className="nav-right-actions">
            <NavLink to="/profile" title="Account">
              <CiUser className="nav-icon" />
            </NavLink>
            <NavLink to="/wishlist" title="Wishlist" className="nav-wishlist-link">
              <CiHeart className="nav-icon" />
              {wishlistCount > 0 && <span className="nav-wishlist-badge">{wishlistCount}</span>}
            </NavLink>
            <NavLink to="/cart" title="Cart" className="nav-cart-link">
              <CiShoppingCart className="nav-icon" />
              {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
            </NavLink>
            {!user && (
              <NavLink to="/login" className="nav-login-link">
                LOGIN
              </NavLink>
            )}
          </div>

          <div 
            className={`hamburger ${menuOpen ? "active" : ""}`} 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </nav>
      )}

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <NavLink to="/" onClick={() => setMenuOpen(false)}>HOME</NavLink>
        <NavLink to="/store" onClick={() => setMenuOpen(false)}>STORE</NavLink>
        <NavLink to="/about" onClick={() => setMenuOpen(false)}>ABOUT</NavLink>
        <NavLink to="/profile" onClick={() => setMenuOpen(false)}>ACCOUNT</NavLink>
        <NavLink to="/wishlist" onClick={() => setMenuOpen(false)}>WISHLIST</NavLink>
        <NavLink to="/cart" onClick={() => setMenuOpen(false)}>CART</NavLink>
        <NavLink to="/login" onClick={() => setMenuOpen(false)}>LOGIN</NavLink>
      </div>
    </div>
  );
}
