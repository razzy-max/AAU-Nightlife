import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventSection.css';

export default function EventSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const cardsToShow = 3;
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/events') // Adjust this path if needed
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  // Carousel navigation
  const handlePrev = () => {
    setCurrent(prev => (prev - cardsToShow + events.length) % events.length);
  };
  const handleNext = () => {
    setCurrent(prev => (prev + cardsToShow) % events.length);
  };

  // Get visible cards
  const visibleEvents = events.slice(0, 12); // Limit to 12 for performance
  const displayed = [];
  for (let i = 0; i < cardsToShow; i++) {
    displayed.push(visibleEvents[(current + i) % visibleEvents.length]);
  }

  return (
    <section className="event-section">
      <h2 className="event-section-title">Featured Upcoming Events</h2>
      <div className="event-carousel-container">
        <button className="carousel-arrow left" onClick={handlePrev} aria-label="Previous">&#8592;</button>
        <div className="event-cards-carousel" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          {loading ? <p>Loading events...</p> : (
            displayed.map(event => event && (
              <div className="event-card" key={event.title + event.date} style={{ width: 220, flex: '0 0 220px', borderRadius: 12, overflow: 'hidden', background: '#23243a', color: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', textAlign: 'center' }}>
                {event.image && (
                  <img src={event.image} alt={event.title} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                )}
                <div style={{ padding: '0.7rem 0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{event.title}</h3>
                </div>
              </div>
            ))
          )}
        </div>
        <button className="carousel-arrow right" onClick={handleNext} aria-label="Next">&#8594;</button>
      </div>
      <style>{`
        .event-section { padding: 2rem 0; }
        .event-section-title { text-align: center; margin-bottom: 1.5rem; }
        .event-carousel-container { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .carousel-arrow { font-size: 2rem; background: none; border: none; color: #23243a; cursor: pointer; padding: 0 0.5rem; }
        .carousel-arrow:focus { outline: 2px solid #23243a; }
        @media (max-width: 700px) {
          .event-cards-carousel { flex-wrap: nowrap !important; overflow-x: auto; }
          .event-card { min-width: 70vw !important; max-width: 85vw !important; }
        }
      `}</style>
    </section>
  );
}
