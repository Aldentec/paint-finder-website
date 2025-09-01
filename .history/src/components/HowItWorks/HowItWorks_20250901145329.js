// src/components/HowItWorks/HowItWorks.js
import React from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Upload Your Image",
      description: "Take a photo of your miniature, model, or reference image and upload it to our color analyzer.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="9" cy="9" r="2"></circle>
          <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21"></path>
        </svg>
      )
    },
    {
      number: 2,
      title: "AI Color Extraction",
      description: "Our advanced algorithm analyzes your image and extracts the dominant colors using k-means clustering.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"></path>
          <path d="M19 10v2a7 7 0 01-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      )
    },
    {
      number: 3,
      title: "Precise Paint Matching",
      description: "Each extracted color is matched against our database using ΔE2000 color difference calculations for scientific accuracy.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5"></path>
        </svg>
      )
    },
    {
      number: 4,
      title: "Get Your Shopping List",
      description: "Receive a curated list of the best paint matches with accuracy ratings and direct shopping recommendations.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3l8-8"></path>
          <path d="M21 12c0 1.66-.35 3.22-1 4.61a9.002 9.002 0 01-11.49 4.88A9 9 0 119 3.51c1.39-.65 2.95-1 4.61-1 .66 0 1.3.07 1.93.2"></path>
        </svg>
      )
    }
  ];

  const features = [
    {
      title: "ΔE2000 Algorithm",
      description: "Industry-standard color difference calculation for the most accurate matches",
      icon: "🎯"
    },
    {
      title: "Comprehensive Database",
      description: "Extensive paint library covering all major miniature paint ranges",
      icon: "🎨"
    },
    {
      title: "Smart Presets",
      description: "Optimized settings for different scenarios: miniatures, terrain, vehicles",
      icon: "⚡"
    },
    {
      title: "Instant Results",
      description: "Get your paint matches in seconds with detailed accuracy ratings",
      icon: "🚀"
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Our advanced color matching technology makes finding the perfect paints simple and accurate
          </p>
        </div>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={step.number} className="step-item">
              <div className="step-content">
                <div className="step-icon">
                  {step.icon}
                </div>
                <div className="step-info">
                  <div className="step-number">Step {step.number}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>

        <div className="features-grid">
          <div className="features-header">
            <h3 className="features-title">Why Our Color Matching Is Superior</h3>
            <p className="features-subtitle">
              Built with precision and tested by hobbyists worldwide
            </p>
          </div>
          <div className="features-cards">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="cta-section">
          <div className="cta-content">
            <h3 className="cta-title">Ready to Find Your Perfect Paint Matches?</h3>
            <p className="cta-description">
              Upload your first image and discover why thousands of hobbyists trust our color matching technology.
            </p>
            <button 
              className="cta-button"
              onClick={() => {
                const paintMatcher = document.getElementById('paint-matcher');
                if (paintMatcher) {
                  paintMatcher.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Start Matching Colors
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12,5 19,12 12,19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;