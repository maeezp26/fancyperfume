import React from "react";
import "./css/HeaderFooter.css";
import { Link } from "react-router-dom";
import whatsapp from './img/wp.jpg';
import insta from './img/instap.png';
import fb from './img/facebook.png';

export default function Footer() {
  return (
    <footer className="luxury-footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section brand">
            <div className="brand-logo">
              <div className="logo-glow"></div>
              <span className="logo-text">FANCY PERFUME</span>
            </div>
            <p className="brand-description">
              Luxurious attars and fragrances inspired by timeless classics and modern favorites. 
              Crafted to leave a lasting impression.
            </p>
            <div className="brand-features">
              <div className="feature">
                <span className="feature-icon">⭐</span>
                <span>100% Authentic</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🛡️</span>
                <span>Premium Quality</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="footer-section navigation">
            <h3 className="section-title">Navigation</h3>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/category" className="footer-link">Category</Link></li>
              <li><Link to="/about" className="footer-link">About Us</Link></li>
              <li><Link to="/contact" className="footer-link">Feedback</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section support">
            <h3 className="section-title">Support</h3>
            <ul className="footer-links">
              <li><Link to="/cart" className="footer-link">Cart</Link></li>
              <li><a href="mailto:support@fancyperfume.com" className="footer-link">Support</a></li>
              <li><a href="#" className="footer-link">Shipping</a></li>
              <li><a href="#" className="footer-link">Returns</a></li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div className="footer-section social">
            <h3 className="section-title">Connect With Us</h3>
            <div className="social-icons">
              <a href="#" className="social-icon" aria-label="Facebook" title="Facebook">
                <img src={fb} alt="Facebook" />
              </a>
              <a href="#" className="social-icon" aria-label="Instagram" title="Instagram">
                <img src={insta} alt="Instagram" />
              </a>
              <a href="#" className="social-icon" aria-label="WhatsApp" title="WhatsApp">
                <img src={whatsapp} alt="WhatsApp" />
              </a>
            </div>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span>hello@fancyperfume.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📱</span>
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="bottom-content">
            <p className="copyright">
              © {new Date().getFullYear()} Fancy Perfume. All Rights Reserved.
            </p>
            <p className="creator">
              Crafted by <span className="highlight">Maeez Pathan</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
