import React from 'react';
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
  return (
    <section className="feature-section" id="features">
      {/* Mobile Carousel */}
      <div className="feature-carousel-mobile">
        {features.map((f, i) => (
          <div className="feature-card small-feature-card" key={i}>
            <div className="feature-icon" style={{ fontSize: '2rem' }}>{f.icon}</div>
            <h3 className="feature-title" style={{ fontSize: '1.1rem' }}>{f.title}</h3>
            <p className="feature-desc" style={{ fontSize: '0.95rem' }}>{f.desc}</p>
          </div>
        ))}
      </div>
      {/* Desktop Carousel/Grid */}
      <div className="feature-grid responsive-feature-grid feature-desktop-grid">
        {features.map((f, i) => (
          <div className="feature-card small-feature-card" key={i}>
            <div className="feature-icon" style={{ fontSize: '2rem' }}>{f.icon}</div>
            <h3 className="feature-title" style={{ fontSize: '1.1rem' }}>{f.title}</h3>
            <p className="feature-desc" style={{ fontSize: '0.95rem' }}>{f.desc}</p>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 700px) {
          .feature-carousel-mobile {
            display: flex;
            flex-direction: row;
            overflow-x: auto;
            gap: 1.2rem;
            padding: 0 1rem 0.5rem 1rem;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            width: 100vw;
            box-sizing: border-box;
            background: transparent;
          }
          .feature-desktop-grid {
            display: none !important;
          }
          .feature-card.small-feature-card {
            min-width: 70vw;
            max-width: 85vw;
            flex: 0 0 auto;
            scroll-snap-align: start;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          .feature-carousel-mobile::-webkit-scrollbar {
            display: none;
          }
        }
        @media (min-width: 701px) {
          .feature-carousel-mobile {
            display: none !important;
          }
          .feature-desktop-grid {
            display: flex !important;
            flex-direction: row;
            gap: 1.2rem;
            max-width: 1000px;
            margin: 0 auto;
            width: 100%;
            overflow-x: auto;
            /* Only show up to 4 cards at a time, allow horizontal scroll for more */
            /* Hide scrollbar for aesthetics */
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .feature-desktop-grid::-webkit-scrollbar {
            display: none;
          }
          .feature-card.small-feature-card {
            min-width: 220px;
            max-width: 240px;
            flex: 0 0 24%;
            /* 4 cards per view, adjust for gap */
            padding: 1.1rem 0.7rem;
            background: #23243a;
            border-radius: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.07);
            text-align: center;
            color: #fff;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 0;
          }
        }
        @media (min-width: 1200px) {
          .feature-card.small-feature-card {
            min-width: 220px;
            max-width: 240px;
            flex: 0 0 22%;
          }
        }
      `}</style>
    </section>
  );
}
