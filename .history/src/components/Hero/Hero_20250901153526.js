// src/components/Hero/Hero.js
import React, { useEffect, useRef } from 'react';
import './Hero.css';

const Hero = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      { r: 99, g: 102, b: 241 },  // Primary blue
      { r: 139, g: 92, b: 246 },  // Purple
      { r: 245, g: 158, b: 11 },  // Accent orange
    ];

    const particles = [];
    const particleCount = 80;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToMatcher = () => {
    const element = document.getElementById('paint-matcher');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Add structured data to the page
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Hobby Paint Finder - AI Paint Color Matching",
      "description": "Upload photos of your miniatures and find perfect paint matches using advanced AI color analysis and ΔE2000 algorithms.",
      "url": "https://hobbypaintfinder.com",
      "mainEntity": {
        "@type": "SoftwareApplication",
        "name": "Hobby Paint Finder Paint Matcher",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      }
    };

    // Add structured data script to head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(s => {
        if (s.textContent.includes('Hobby Paint Finder Paint Matcher')) {
          s.remove();
        }
      });
    };
  }, []);

  return (
    <section 
      id="home" 
      className="hero"
      role="banner"
      aria-labelledby="hero-heading"
      itemScope
      itemType="https://schema.org/WebPage"
    >
      <canvas 
        ref={canvasRef} 
        className="hero-canvas"
        aria-hidden="true"
        role="presentation"
      />
      
      <div className="hero-content">
        <div className="hero-badge" role="complementary">
          <span className="badge-text" aria-label="Professional Paint Matching Tool">
            🎨 Professional Paint Matching
          </span>
        </div>
        
        <header>
          <h1 
            id="hero-heading"
            className="hero-title"
            itemProp="name"
          >
            <span className="title-gradient">Match Any Color</span>
            <span className="title-regular">to Hobby Paints</span>
          </h1>
        </header>
        
        <p 
          className="hero-description"
          itemProp="description"
        >
          Upload a photo of your miniature and instantly find the perfect matching paints 
          from <strong>Citadel, Vallejo, and Army Painter</strong>. Powered by advanced color science 
          and <abbr title="Delta E 2000 - Industry standard color difference calculation">ΔE2000</abbr> matching algorithm.
        </p>
        
        <div className="hero-actions" role="group" aria-label="Hero actions">
          <button 
            className="cta-primary"
            onClick={scrollToMatcher}
            aria-describedby="cta-description"
            type="button"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              aria-hidden="true"
              role="presentation"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Start Matching Colors
          </button>
          
          <a 
            href="/how-it-works" 
            className="cta-secondary"
            aria-label="Learn how our color matching technology works"
          >
            How It Works
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              aria-hidden="true"
              role="presentation"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12,5 19,12 12,19"></polyline>
            </svg>
          </a>
          
          <p 
            id="cta-description" 
            className="hero-subtext"
          >
            Free to use • No registration required • Instant results
          </p>
        </div>
        
        <div className="hero-stats" role="complementary" aria-label="Usage statistics">
          <div className="stat-item">
            <strong className="stat-number" aria-label="Over 600 paints in database">600+</strong>
            <span className="stat-label">Paint Database</span>
          </div>
          <div className="stat-item">
            <strong className="stat-number" aria-label="Delta E 2000 scientific accuracy">ΔE2000</strong>
            <span className="stat-label">Scientific Accuracy</span>
          </div>
          <div className="stat-item">
            <strong className="stat-number" aria-label="Results in under 2 seconds">&lt;2s</strong>
            <span className="stat-label">Processing Time</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;