// src/components/Header/Header.js
import React, { useState, useEffect } from 'react';
import logo from '../../assets/logo_swatch_stack_512.png';
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
            <span className="logo-text"> <img height="60px" src={logo}></img>Hobby Paint Finder</span>
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