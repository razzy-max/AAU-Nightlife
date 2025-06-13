import React from 'react';
import './App.css';

export default function Marquee({ text }) {
  return (
    <div className="marquee-container">
      <div className="marquee">
        <span>{text}</span>
        <span aria-hidden="true">{text}</span>
      </div>
    </div>
  );
}
