import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const features = [
  {
    icon: '🎉',
    title: 'Exciting Student Events',
    desc: 'Discover and join the best parties, concerts, and campus events happening in Ekpoma every week.'
  },
  {
    icon: '💼',
    title: 'Student Job Opportunities',
    desc: 'Find flexible part-time jobs and internships tailored for AAU students to support your academic journey.'
  },
  {
    icon: '🤝',
    title: 'Connect & Network',
    desc: 'Meet new friends, connect with local businesses, and grow your professional network within the AAU community.'
  },
  // {
  //   icon: '📱',
  //   title: 'Mobile-Friendly Experience',
  //   desc: 'Enjoy a seamless, easy-to-navigate platform optimized for your phone, tablet, or desktop.'
  // },
  {
    icon: '🔔',
    title: 'Stay Updated',
    desc: 'Get instant notifications about upcoming events, job openings, and exclusive student offers.'
  },
  {
    icon: '🌟',
    title: 'Safe & Inclusive',
    desc: 'A welcoming space for all AAU students, prioritizing safety, inclusivity, and community spirit.'
  }
];

export default function FeatureSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const carouselRef = useRef(null);

  // Auto-play functionality for mobile carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Touch handlers for swipe functionality
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // Swipe left - next slide
          setCurrentSlide(prev => (prev + 1) % features.length);
        } else {
          // Swipe right - previous slide
          setCurrentSlide(prev => (prev - 1 + features.length) % features.length);
        }
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;

    // Resume auto-play after 3 seconds
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  return (
    <section className="feature-section" id="features">
      {/* Section Header */}
      <div className="feature-header">
        <h2 className="feature-main-title">
          Why Choose AAU Nightlife?
        </h2>
        <p className="feature-subtitle">
          Discover everything you need to make the most of your student life in Ekpoma
        </p>
      </div>

      {/* Mobile Carousel Container */}
      <div className="feature-mobile-container">
        <div
          className="feature-carousel-mobile"
          ref={carouselRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {features.map((f, i) => (
            <div
              className={`feature-card mobile-feature-card ${i === currentSlide ? 'active' : ''}`}
              key={i}
              style={{
                transform: `translateX(${(i - currentSlide) * 100}%)`,
                transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}
            >
              <div className="feature-icon-mobile">{f.icon}</div>
              <h3 className="feature-title-mobile">{f.title}</h3>
              <p className="feature-desc-mobile">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Carousel Indicators */}
        <div className="carousel-indicators">
          {features.map((_, i) => (
            <button
              key={i}
              className={`indicator ${i === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="feature-grid-desktop">
        {features.map((f, i) => (
          <div className="feature-card desktop-feature-card" key={i}>
            <div className="feature-icon-desktop">{f.icon}</div>
            <h3 className="feature-title-desktop">{f.title}</h3>
            <p className="feature-desc-desktop">{f.desc}</p>
          </div>
        ))}
      </div>
      <style>{`
        /* Feature Section Header */
        .feature-header {
          text-align: center;
          margin-bottom: var(--space-3xl);
          position: relative;
          z-index: 2;
        }

        .feature-main-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          margin-bottom: var(--space-md);
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        .feature-subtitle {
          font-size: 1.2rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Mobile Carousel Styles */
        .feature-mobile-container {
          display: none;
          position: relative;
          width: 100%;
          overflow: hidden;
          padding: 0 var(--space-md);
        }

        .feature-carousel-mobile {
          position: relative;
          width: 100%;
          height: 400px;
          overflow: hidden;
          border-radius: var(--radius-2xl);
        }

        .mobile-feature-card {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15,23,42,0.04);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-2xl);
          padding: var(--space-2xl);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .mobile-feature-card.active {
          box-shadow: var(--shadow-xl), 0 0 40px rgba(0, 212, 255, 0.2);
          border-color: var(--accent-primary);
        }

        .feature-icon-mobile {
          font-size: 4rem;
          margin-bottom: var(--space-lg);
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 15px rgba(6, 255, 165, 0.4));
        }

        .feature-title-mobile {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: var(--space-md);
          color: var(--text-primary);
          line-height: 1.3;
        }

        .feature-desc-mobile {
          font-size: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 280px;
        }

        /* Carousel Indicators */
        .carousel-indicators {
          display: flex;
          justify-content: center;
          gap: var(--space-sm);
          margin-top: var(--space-lg);
        }

        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: var(--accent-primary);
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
          transform: scale(1.2);
        }

        /* Desktop Grid Styles */
        .feature-grid-desktop {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-xl);
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .desktop-feature-card {
          background: rgba(15,23,42,0.04);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-lg);
          padding: var(--space-xl) var(--space-lg) var(--space-lg) var(--space-lg);
          text-align: center;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .desktop-feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--gradient-secondary);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .desktop-feature-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: var(--shadow-xl), 0 0 40px rgba(0, 212, 255, 0.2);
          border-color: var(--accent-primary);
        }

        .desktop-feature-card:hover::before {
          opacity: 0.05;
        }

        .desktop-feature-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.6s ease;
        }

        .desktop-feature-card:hover::after {
          left: 100%;
        }

        .feature-icon-desktop {
          font-size: 3rem;
          margin-bottom: var(--space-lg);
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 10px rgba(6, 255, 165, 0.3));
        }

        .feature-title-desktop {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: var(--space-md);
          color: var(--text-primary);
          line-height: 1.3;
        }

        .feature-desc-desktop {
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Responsive Breakpoints */
        @media (max-width: 768px) {
          .feature-grid-desktop {
            display: none !important;
          }

          .feature-mobile-container {
            display: block !important;
          }

          .feature-main-title {
            font-size: 2.2rem !important;
          }

          .feature-subtitle {
            font-size: 1.1rem !important;
            padding: 0 var(--space-md);
          }
        }

        @media (min-width: 769px) {
          .feature-mobile-container {
            display: none !important;
          }

          .feature-grid-desktop {
            display: grid !important;
          }
        }

        @media (max-width: 480px) {
          .feature-carousel-mobile {
            height: 350px;
          }

          .mobile-feature-card {
            padding: var(--space-lg);
          }

          .feature-icon-mobile {
            font-size: 3rem;
          }

          .feature-title-mobile {
            font-size: 1.3rem;
          }

          .feature-desc-mobile {
            font-size: 1rem;
            max-width: 240px;
          }

          .feature-header {
            margin-bottom: var(--space-2xl) !important;
          }
        }
      `}</style>
    </section>
  );
}
