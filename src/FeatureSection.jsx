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
      <div className="feature-grid responsive-feature-grid feature-carousel-mobile">
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
          .feature-grid,
          .responsive-feature-grid,
          .feature-carousel-mobile {
            display: flex !important;
            flex-direction: row;
            overflow-x: auto;
            gap: 1.2rem;
            padding: 0 1rem 0.5rem 1rem;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            width: 100vw;
            box-sizing: border-box;
          }
          .feature-card.small-feature-card {
            min-width: 80vw;
            max-width: 90vw;
            flex: 0 0 auto;
            scroll-snap-align: start;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          .feature-carousel-mobile::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
