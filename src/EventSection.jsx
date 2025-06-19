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
      if (window.innerWidth < 600) setCardsToShow(1);
      else if (window.innerWidth < 900) setCardsToShow(2);
      else setCardsToShow(3);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carousel logic
  useEffect(() => {
    if (events.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrent(prev => (prev + cardsToShow) % Math.min(events.length, 6));
      }, 3000);
      return () => clearInterval(intervalRef.current);
    }
  }, [events, cardsToShow]);

  const visibleEvents = events.slice(0, 6);
  const displayed = [];
  for (let i = 0; i < cardsToShow; i++) {
    displayed.push(visibleEvents[(current + i) % visibleEvents.length]);
  }

  // Navigation handlers
  const handlePrev = () => {
    setCurrent(prev => (prev - cardsToShow + visibleEvents.length) % visibleEvents.length);
  };
  const handleNext = () => {
    setCurrent(prev => (prev + cardsToShow) % visibleEvents.length);
  };

  return (
    <section className="event-section">
      <h2 className="event-section-title">Featured Upcoming Events</h2>
      <div className="event-cards-carousel" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem'}}>
        {visibleEvents.length > cardsToShow && (
          <button className="carousel-arrow left" onClick={handlePrev} aria-label="Previous" style={{fontSize: 28, background: 'none', border: 'none', cursor: 'pointer'}}>&#8592;</button>
        )}
        <div className="event-cards" style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
          {loading ? <p>Loading events...</p> : (
            visibleEvents.length === 0 ? <p>No events yet.</p> : (
              displayed.map(event => event && (
                <div className="event-card" key={event.title + event.date}>
                  {event.image && (
                    <img src={event.image} alt={event.title} className="event-card-img" />
                  )}
                  <div className="event-card-body">
                    <h3 className="event-card-title">{event.title}</h3>
                    {/* Description removed for shorter card */}
                    <button
                      className="event-card-btn"
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
        {visibleEvents.length > cardsToShow && (
          <button className="carousel-arrow right" onClick={handleNext} aria-label="Next" style={{fontSize: 28, background: 'none', border: 'none', cursor: 'pointer'}}>&#8594;</button>
        )}
      </div>
    </section>
  );
}
