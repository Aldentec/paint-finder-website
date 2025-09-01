// src/components/Header/Header.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo_swatch_stack_512.png'
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      // If not on home page, navigate to home first
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <nav className="nav">
          <Link to="/" className="logo">
            <img height="60px" src={logo}></img>
            <span className="logo-text">PaintFinder</span>
          </Link>

          <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/how-it-works" 
              className={`nav-link ${location.pathname === '/how-it-works' ? 'active' : ''}`}
            >
              How It Works
            </Link>
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