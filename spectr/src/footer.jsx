import React from "react";
import "./components/footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        {/* Brand Information Column */}
        <div className="footer-col brand-col">
          <p className="footer-tagline">DESIGNED FOR WHAT'S NEXT</p>
        </div>

        {/* Directory Links Column */}
        <div className="footer-col">
          <h4 className="footer-col-title">DIRECTORY</h4>
          <ul className="footer-links-list">
            <li><Link to="/">HOME</Link></li>
            <li><Link to="/store">STORE</Link></li>
            <li><Link to="/profile">ACCOUNT</Link></li>
          </ul>
        </div>

        {/* Category Links Column */}
        <div className="footer-col">
          <h4 className="footer-col-title">COLLECTIONS</h4>
          <ul className="footer-links-list">
            <li><Link to="/store">EYEWEAR</Link></li>
            <li><Link to="/store">APPAREL</Link></li>
            <li><Link to="/store">NEW ARRIVALS</Link></li>
          </ul>
        </div>

        {/* Connect Links Column */}
        <div className="footer-col">
          <h4 className="footer-col-title">CONNECT</h4>
          <ul className="footer-links-list">
            <li><a href="https://instagram.com" target="_blank" rel="noreferrer">INSTAGRAM</a></li>
            <li><a href="https://twitter.com" target="_blank" rel="noreferrer">TWITTER</a></li>
            <li><a href="https://tiktok.com" target="_blank" rel="noreferrer">TIKTOK</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-divider"></div>

      <div className="footer-bottom">
        <span className="footer-copyright">
          © 2026 SPECTR. ALL RIGHTS RESERVED.
        </span>
        <span className="footer-credits">
          MADE BY JUNAID
        </span>
      </div>
    </footer>
  );
}
