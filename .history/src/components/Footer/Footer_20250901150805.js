// src/components/Footer/Footer.js
import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4 className="footer-title">PaintFinder</h4>
            <p className="footer-description">
              Advanced color matching for miniature painters. 
              Find the perfect paint match using cutting-edge color science.
            </p>
            <div className="footer-badges">
              <span className="tech-badge">React 19</span>
              <span className="tech-badge">AWS Lambda</span>
              <span className="tech-badge">ΔE2000</span>
            </div>
          </div>

          <div className="footer-section">
            <h5 className="footer-subtitle">Features</h5>
            <ul className="footer-links">
              <li><a href="#features">K-means Clustering</a></li>
              <li><a href="#features">Lab Color Space</a></li>
              <li><a href="#features">Blue Edge Detection</a></li>
              <li><a href="#features">Multiple Paint Brands</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h5 className="footer-subtitle">Supported Brands</h5>
            <ul className="footer-links">
              <li><a href="#brands">Citadel</a></li>
              <li><a href="#brands">Vallejo</a></li>
              <li><a href="#brands">Army Painter</a></li>
              <li><a href="#brands">P3 (Coming Soon)</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright-section">
            <p className="copyright">© 2025-{currentYear} PaintFinder. All rights reserved.</p>
            <p className="made-with">
              Made with <span className="heart">♥</span> for miniature painters
            </p>
          </div>
          <div className="creator-credit">
            <p className="created-by">
              Created with love by{' '}
              <a 
                href="https://doriansmith.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="creator-link"
              >
                Dorian Smith
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;