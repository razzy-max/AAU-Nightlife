import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventSection.css';

export default function EventSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://aau-nightlife-production.up.railway.app/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  // Responsive cardsToShow
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 900) setCardsToShow(1);
      else if (window.innerWidth < 1200) setCardsToShow(2);
      else setCardsToShow(3);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carousel logic (auto-scroll)
  useEffect(() => {
    if (events.length > cardsToShow) {
      intervalRef.current = setInterval(() => {
        setCurrent(prev => (prev + 1) % (events.length - cardsToShow + 1));
      }, 3500);
      return () => clearInterval(intervalRef.current);
    }
  }, [events, cardsToShow]);

  // Calculate visible cards for desktop carousel (no duplicates)
  const visibleEvents = events.slice(current, current + cardsToShow);

  // Navigation handlers
  const handlePrev = () => {
    setCurrent(prev => prev === 0 ? events.length - cardsToShow : prev - 1);
  };
  const handleNext = () => {
    setCurrent(prev => (prev + 1) % (events.length - cardsToShow + 1));
  };

  return (
    <section className="event-section">
      <h2 className="event-section-title">Featured Upcoming Events</h2>
      <div className="event-carousel-desktop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', margin: '0 auto', maxWidth: 1100 }}>
        {events.length > cardsToShow && (
          <button className="carousel-arrow left" onClick={handlePrev} aria-label="Previous" style={{fontSize: 32, background: 'none', border: 'none', cursor: 'pointer'}}>&#8592;</button>
        )}
        <div className="event-cards-desktop" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', width: '100%' }}>
          {loading ? <p>Loading events...</p> : (
            visibleEvents.length === 0 ? <p>No events yet.</p> : (
              visibleEvents.map(event => event && (
                <div className="event-card" key={event.title + event.date} style={{ width: 320, borderRadius: 16, overflow: 'hidden', background: '#23243a', color: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.10)', textAlign: 'center', flex: '0 0 320px' }}>
                  {event.image && (
                    <img src={event.image} alt={event.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: '1.1rem 0.7rem' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{event.title}</h3>
                    <button
                      className="event-card-btn"
                      style={{ marginTop: 16 }}
                      onClick={() => navigate(`/events?event=${encodeURIComponent(event.title)}`)}
                    >
                      Read More
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
        {events.length > cardsToShow && (
          <button className="carousel-arrow right" onClick={handleNext} aria-label="Next" style={{fontSize: 32, background: 'none', border: 'none', cursor: 'pointer'}}>&#8594;</button>
        )}
      </div>
      <style>{`
        @media (max-width: 900px) {
          .event-carousel-desktop { flex-direction: column; gap: 1rem; }
          .event-cards-desktop { flex-direction: row; overflow-x: auto; }
          .event-card { min-width: 70vw !important; max-width: 85vw !important; }
        }
      `}</style>
    </section>
  );
}
