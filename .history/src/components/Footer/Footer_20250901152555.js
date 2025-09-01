// src/components/Footer/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="footer"
      role="contentinfo"
      itemScope
      itemType="https://schema.org/WPFooter"
    >
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4 className="footer-title" itemProp="name">Hobby Paint Finder</h4>
            <p 
              className="footer-description"
              itemProp="description"
            >
              Advanced <strong>AI color matching</strong> for miniature painters. 
              Find the perfect paint match using cutting-edge color science and <strong>ΔE2000 algorithms</strong>.
            </p>
            <div className="footer-badges" role="list" aria-label="Technology stack">
              <span className="tech-badge" role="listitem" aria-label="Built with React 19">React 19</span>
              <span className="tech-badge" role="listitem" aria-label="Powered by AWS Lambda">AWS Lambda</span>
              <span className="tech-badge" role="listitem" aria-label="Uses Delta E 2000 color accuracy">ΔE2000</span>
            </div>
          </div>

          <nav 
            className="footer-section"
            role="navigation"
            aria-labelledby="features-nav-heading"
          >
            <h5 id="features-nav-heading" className="footer-subtitle">Features</h5>
            <ul className="footer-links" role="list">
              <li role="listitem">
                <Link 
                  to="/how-it-works#k-means" 
                  aria-label="Learn about K-means clustering color extraction"
                >
                  K-means Clustering
                </Link>
              </li>
              <li role="listitem">
                <Link 
                  to="/how-it-works#lab-color-space" 
                  aria-label="Learn about Lab color space technology"
                >
                  Lab Color Space
                </Link>
              </li>
              <li role="listitem">
                <Link 
                  to="/how-it-works#edge-detection" 
                  aria-label="Learn about blue edge detection algorithm"
                >
                  Blue Edge Detection
                </Link>
              </li>
              <li role="listitem">
                <Link 
                  to="/how-it-works#paint-brands" 
                  aria-label="View all supported paint brands"
                >
                  Multiple Paint Brands
                </Link>
              </li>
            </ul>
          </nav>

          <nav 
            className="footer-section"
            role="navigation"
            aria-labelledby="brands-nav-heading"
          >
            <h5 id="brands-nav-heading" className="footer-subtitle">Supported Paint Brands</h5>
            <ul className="footer-links" role="list">
              <li role="listitem">
                <a 
                  href="https://www.games-workshop.com/en-US/Painting-Modelling" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Citadel paints - Games Workshop (opens in new tab)"
                >
                  Citadel Paints
                </a>
              </li>
              <li role="listitem">
                <a 
                  href="https://acrylicosvallejo.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Vallejo paints official website (opens in new tab)"
                >
                  Vallejo Paints
                </a>
              </li>
              <li role="listitem">
                <a 
                  href="https://thearmypainter.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Army Painter paints official website (opens in new tab)"
                >
                  Army Painter
                </a>
              </li>
              <li role="listitem">
                <span aria-label="P3 paints support coming soon">
                  P3 <small>(Coming Soon)</small>
                </span>
              </li>
            </ul>
          </nav>
        </div>

        <div 
          className="footer-bottom"
          role="group"
          aria-label="Copyright and credits"
        >
          <div className="copyright-section">
            <p className="copyright">
              <small>
                © 2025-{currentYear} <span itemProp="copyrightHolder">Hobby Paint Finder</span>. All rights reserved.
              </small>
            </p>
            <p className="made-with">
              Made with <span className="heart" aria-label="love" role="img">♥</span> for miniature painters
            </p>
          </div>
          <div className="creator-credit">
            <p className="created-by">
              <small>
                Created with love by{' '}
                <a 
                  href="https://doriansmith.dev" 
                  target="_blank" 
                  rel="noopener noreferrer author"
                  className="creator-link"
                  itemProp="author"
                  itemScope
                  itemType="https://schema.org/Person"
                  aria-label="Visit Dorian Smith's portfolio website (opens in new tab)"
                >
                  <span itemProp="name">Dorian Smith</span>
                </a>
              </small>
            </p>
          </div>
        </div>

        {/* Structured data for organization */}
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Hobby Paint Finder",
              "url": "https://hobbypaintfinder.com",
              "logo": "https://hobbypaintfinder.com/logo192.png",
              "description": "AI-powered paint color matching for miniature painters using ΔE2000 color science",
              "founder": {
                "@type": "Person",
                "name": "Dorian Smith",
                "url": "https://doriansmith.dev"
              },
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web Browser",
              "sameAs": [
                "https://github.com/doriansmith/hobby-paint-finder"
              ]
            })
          }}
        />
      </div>
    </footer>
  );
};

export default Footer;