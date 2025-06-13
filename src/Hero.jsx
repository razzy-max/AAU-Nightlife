import React, { useState, useEffect } from 'react';
import './App.css';

const heroImages = [
  'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1515168833906-d2a3b82b3029?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1468071174046-657d9d351a40?auto=format&fit=crop&w=800&q=80',
];

export default function Hero() {
  const [imgIdx, setImgIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setImgIdx(idx => (idx + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="hero-section"
      style={{
        backgroundImage: `url(${heroImages[imgIdx]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.7s ease-in-out',
        position: 'relative',
      }}
    >
      <div className="hero-bg-anim" />
      <div className="hero-content">
        <h1
          className="hero-title"
          style={{
            color: 'white',
            fontSize: '5.5rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            padding: '0 1rem', // Add horizontal padding
            width: '100%',
            boxSizing: 'border-box',
            textAlign: 'center',
          }}
        >
          Welcome to AAU Nightlife
        </h1>
        <p className="hero-subtitle"> Where Every Night is an Experience!</p>
      </div>
      <style>{`
        @media (max-width: 600px) {
          .hero-title {
            font-size: 2.2rem !important;
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }
        }
      `}</style>
    </section>
  );
}
