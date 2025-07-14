import React from 'react';
import './App.css';

export default function Marquee({ text }) {
  return (
    <div className="marquee-container" style={{
      background: 'var(--secondary-bg)',
      borderTop: '1px solid var(--border-color)',
      borderBottom: '1px solid var(--border-color)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Modern gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--gradient-secondary)',
        opacity: 0.05,
        zIndex: 1
      }} />

      <div className="marquee" style={{ position: 'relative', zIndex: 2 }}>
        <span style={{
          background: 'var(--gradient-accent)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: '600',
          textShadow: '0 0 20px rgba(6, 255, 165, 0.3)'
        }}>
          {text}
        </span>
        <span aria-hidden="true" style={{
          background: 'var(--gradient-accent)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: '600',
          textShadow: '0 0 20px rgba(6, 255, 165, 0.3)'
        }}>
          {text}
        </span>
      </div>
    </div>
  );
}
