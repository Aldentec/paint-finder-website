// src/components/Header/Header.js
import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <nav className="nav">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="url(#logo-gradient)" strokeWidth="2"/>
              <path d="M16 8L20 12L16 16L12 12L16 8Z" fill="url(#logo-gradient)"/>
              <path d="M16 16L20 20L16 24L12 20L16 16Z" fill="url(#logo-gradient)" opacity="0.6"/>
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#6366f1"/>
                  <stop offset="1" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="logo-text">PaintFinder</span>
          </div>

          <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <a href="#home" className="nav-link">Home</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
          </div>

          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`menu-bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`menu-bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`menu-bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;