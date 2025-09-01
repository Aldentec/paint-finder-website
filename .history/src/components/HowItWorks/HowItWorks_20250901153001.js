// src/pages/HowItWorksPage.js
import React, { useEffect } from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './HowItWorks.css';

const HowItWorksPage = () => {
  useEffect(() => {
    // Update page title and meta description
    document.title = "How It Works - Hobby Paint Finder | AI Color Matching Technology";
    
    // Add meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = 'Learn how Hobby Paint Finder uses AI and ΔE2000 algorithms to match miniature colors to hobby paints. Discover our 4-step process and advanced color science technology.';

    // Add structured data for the How It Works page
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "How Hobby Paint Finder Works",
      "description": "Complete guide to AI-powered paint color matching technology for miniature painters",
      "url": "https://hobbypaintfinder.com/how-it-works",
      "mainEntity": {
        "@type": "HowTo",
        "name": "How to Match Paint Colors for Miniatures",
        "description": "Step-by-step guide to finding perfect paint matches using AI color analysis",
        "step": [
          {
            "@type": "HowToStep",
            "name": "Upload Your Image",
            "text": "Take a photo of your miniature and upload it to our color analyzer"
          },
          {
            "@type": "HowToStep", 
            "name": "AI Color Extraction",
            "text": "Our k-means clustering algorithm analyzes and extracts dominant colors"
          },
          {
            "@type": "HowToStep",
            "name": "Precise Paint Matching",
            "text": "Colors are matched using ΔE2000 color difference calculations"
          },
          {
            "@type": "HowToStep",
            "name": "Get Your Shopping List",
            "text": "Receive curated paint recommendations with accuracy ratings"
          }
        ]
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup
    return () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(s => {
        if (s.textContent.includes('How to Match Paint Colors')) {
          s.remove();
        }
      });
    };
  }, []);

  const steps = [
    {
      number: 1,
      title: "Upload Your Image",
      description: "Take a photo of your miniature, model, or reference image and upload it to our color analyzer. We support all common image formats including JPG, PNG, and WEBP.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="9" cy="9" r="2"></circle>
          <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21"></path>
        </svg>
      ),
      tips: [
        "Use good lighting for best results",
        "Focus on the areas you want to match",
        "Higher resolution images work better"
      ]
    },
    {
      number: 2,
      title: "AI Color Extraction",
      description: "Our advanced k-means clustering algorithm analyzes your image and intelligently extracts the most dominant and relevant colors. You can adjust the number of colors (k-value) to get more or fewer matches.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"></path>
          <path d="M19 10v2a7 7 0 01-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      ),
      tips: [
        "Start with 6-9 colors for most projects",
        "Use fewer colors for simple schemes",
        "Smart presets optimize extraction automatically"
      ]
    },
    {
      number: 3,
      title: "Precise Paint Matching",
      description: "Each extracted color is matched against our comprehensive database using the ΔE2000 color difference formula—the industry standard for perceptual color accuracy. Lower ΔE values mean better matches.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5"></path>
        </svg>
      ),
      tips: [
        "ΔE < 5: Excellent match (nearly identical)",
        "ΔE 5-10: Good match (very close)",
        "ΔE > 10: Fair match (similar tone)"
      ]
    },
    {
      number: 4,
      title: "Get Your Shopping List",
      description: "Receive a curated list of the best paint matches with detailed information including brand, range, finish type, and accuracy ratings. Export your list or copy individual paint names.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3l8-8"></path>
          <path d="M21 12c0 1.66-.35 3.22-1 4.61a9.002 9.002 0 01-11.49 4.88A9 9 0 119 3.51c1.39-.65 2.95-1 4.61-1 .66 0 1.3.07 1.93.2"></path>
        </svg>
      ),
      tips: [
        "Shopping list shows only the best matches",
        "Export feature creates a convenient text file",
        "Copy individual paint names to clipboard"
      ]
    }
  ];

  const features = [
    {
      title: "ΔE2000 Algorithm",
      description: "We use the industry-standard CIEDE2000 color difference formula, which accounts for human visual perception better than older methods like RGB distance calculations.",
      icon: "🎯",
      details: [
        "Perceptually uniform color space",
        "Accounts for human vision quirks",
        "Industry standard since 2001"
      ]
    },
    {
      title: "Comprehensive Database",
      description: "Our database includes thousands of paints from major manufacturers, regularly updated with new releases and accurate color values.",
      icon: "🎨",
      details: [
        "Citadel, Vallejo, Army Painter & more",
        "Regular database updates",
        "Verified color accuracy"
      ]
    },
    {
      title: "Smart Presets",
      description: "Intelligent presets automatically optimize color extraction based on image content—miniatures, terrain, vehicles, or general purpose.",
      icon: "⚡",
      details: [
        "Auto-detection of image type",
        "Optimized clustering parameters",
        "Better results with less effort"
      ]
    },
    {
      title: "Instant Results",
      description: "Get your paint matches in seconds with detailed accuracy ratings, brand information, and direct shopping recommendations.",
      icon: "🚀",
      details: [
        "Sub-second processing time",
        "Detailed match information",
        "Export-ready shopping lists"
      ]
    }
  ];

  const faqs = [
    {
      question: "How accurate are the color matches?",
      answer: "Our matches use the ΔE2000 formula with excellent matches (ΔE < 5) being nearly indistinguishable to the human eye. Most matches fall within ΔE 2-8 range."
    },
    {
      question: "What image formats are supported?",
      answer: "We support JPG, PNG, WEBP, and most common image formats. For best results, use high-resolution images with good lighting."
    },
    {
      question: "Can I match colors from painted miniatures?",
      answer: "Absolutely! The tool works great with painted miniatures, models, artwork, or any reference image. Use our 'miniature' preset for optimal results."
    },
    {
      question: "How many paint brands do you support?",
      answer: "We support all major miniature paint brands including Citadel, Vallejo Model Color, Army Painter, Scale75, and many others."
    }
  ];

  return (
    <div className="how-it-works-page">
      <Header />
      
      <main className="main-content" id="main-content">
        {/* Hero Section */}
        <section className="hero-section" itemScope itemType="https://schema.org/WebPage">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title" itemProp="name">How Our AI Color Matching Works</h1>
              <p className="hero-description" itemProp="description">
                Discover the science and technology behind our advanced paint matching system. 
                From AI-powered color extraction to scientific accuracy measurements using ΔE2000 algorithms.
              </p>
              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-number" aria-label="Over 5000 paints in database">5000+</div>
                  <div className="stat-label">Paint Database</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number" aria-label="Delta E 2000 scientific accuracy">ΔE2000</div>
                  <div className="stat-label">Scientific Accuracy</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number" aria-label="Results in under 2 seconds">&lt;2s</div>
                  <div className="stat-label">Processing Time</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="steps-section" itemScope itemType="https://schema.org/HowTo">
          <div className="container">
            <h2 className="section-title" itemProp="name">The 4-Step Process</h2>
            <div className="steps-container">
              {steps.map((step, index) => (
                <div key={step.number} className="step-item" itemScope itemType="https://schema.org/HowToStep">
                  <div className="step-content">
                    <div className="step-icon" aria-hidden="true">
                      {step.icon}
                    </div>
                    <div className="step-info">
                      <div className="step-number">Step {step.number}</div>
                      <h3 className="step-title" itemProp="name">{step.title}</h3>
                      <p className="step-description" itemProp="text">{step.description}</p>
                      <div className="step-tips">
                        <h4>Pro Tips:</h4>
                        <ul>
                          {step.tips.map((tip, tipIndex) => (
                            <li key={tipIndex}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && <div className="step-connector" aria-hidden="true"></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <div className="features-header">
              <h2 className="section-title">Advanced Technology</h2>
              <p className="section-subtitle">
                Built with cutting-edge algorithms and tested by thousands of hobbyists
              </p>
            </div>
            <div className="features-grid">
              {features.map((feature, index) => (
                <article key={index} className="feature-card" itemScope itemType="https://schema.org/Thing">
                  <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
                  <h3 className="feature-title" itemProp="name">{feature.title}</h3>
                  <p className="feature-description" itemProp="description">{feature.description}</p>
                  <ul className="feature-details">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex}>{detail}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section" itemScope itemType="https://schema.org/FAQPage">
          <div className="container">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="faq-grid">
              {faqs.map((faq, index) => (
                <article key={index} className="faq-item" itemScope itemType="https://schema.org/Question">
                  <h3 className="faq-question" itemProp="name">{faq.question}</h3>
                  <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                    <p className="faq-answer" itemProp="text">{faq.answer}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Try It Yourself?</h2>
              <p className="cta-description">
                Experience the precision of our color matching technology. Upload your first image and see the results.
              </p>
              <a 
                href="/" 
                className="cta-button"
                aria-label="Try Hobby Paint Finder color matching tool"
              >
                Try Color Matching Now
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12,5 19,12 12,19"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;