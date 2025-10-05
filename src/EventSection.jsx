import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from './config';
import './EventSection.css';

export default function EventSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(API_ENDPOINTS.events)
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

  // Swipe gesture handlers for mobile
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 50) { // threshold
        if (diff > 0) handleNext(); // swipe left
        else handlePrev(); // swipe right
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section className="event-section-modern">
      {/* Artistic Background Elements */}
      <div className="event-section-background">
        <div className="event-floating-shape shape-1"></div>
        <div className="event-floating-shape shape-2"></div>
        <div className="event-floating-shape shape-3"></div>
        <div className="event-floating-shape shape-4"></div>
      </div>

      {/* Modern Header */}
      <div className="event-section-header">
        <h2 className="event-section-title-modern">
          <span className="event-title-line-1">Featured</span>
          <span className="event-title-line-2">Upcoming Events</span>
        </h2>
        <p className="event-section-subtitle">
          Discover the hottest events happening in the AAU community
        </p>
      </div>

      {/* Modern Carousel Container */}
      <div
        className="event-carousel-modern"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {events.length > cardsToShow && (
          <button className="carousel-arrow-modern left" onClick={handlePrev} aria-label="Previous">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
        )}

        <div className="event-cards-container-modern">
          {loading ? (
            <div className="event-loading-modern">
              <div className="loading-spinner-modern"></div>
              <p className="loading-text">Loading events...</p>
            </div>
          ) : visibleEvents.length === 0 ? (
            <div className="event-empty-state">
              <div className="empty-state-icon">🎉</div>
              <h3 className="empty-state-title">No events yet</h3>
              <p className="empty-state-text">Check back soon for exciting upcoming events!</p>
            </div>
          ) : (
            visibleEvents.map(event => event && (
              <div className="event-card-modern" key={event._id || (event.title + (event.date || ''))}>
                <div className="event-card-image-container">
                  {event.image && (
                    <img src={event.image} alt={event.title} className="event-card-img-modern" />
                  )}
                  <div className="event-card-overlay"></div>
                  <div className="event-card-date-badge">
                    {event.comingSoon || !event.date ? (
                      <div className="event-date-display coming-soon">
                        <span className="coming-text">Coming Soon</span>
                      </div>
                    ) : (
                      <div className="event-date-display">
                        <span className="event-month">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="event-day">
                          {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="event-card-content-modern">
                  <h3 className="event-card-title-modern">{event.title}</h3>

                  {event.venue && (
                    <div className="event-venue-modern">
                      <svg className="venue-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>{event.venue}</span>
                    </div>
                  )}

                  <button
                    className="event-card-btn-modern"
                    onClick={() => navigate(`/events?event=${encodeURIComponent(event.title)}`)}
                  >
                    <span>Learn More</span>
                    <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {events.length > cardsToShow && (
          <button className="carousel-arrow-modern right" onClick={handleNext} aria-label="Next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        )}
      </div>
      <style>{`
        /* Mobile responsive adjustments */
        @media (max-width: 900px) {
          .event-carousel-modern {
            flex-direction: column;
            gap: var(--space-lg);
            padding: 0 var(--space-sm);
          }
          .event-cards-container-modern {
            flex-direction: row;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .event-cards-container-modern::-webkit-scrollbar {
            display: none;
          }
          .event-card-modern {
            min-width: 280px !important;
            max-width: 320px !important;
            scroll-snap-align: center;
          }
          .carousel-arrow-modern {
            display: none !important;
          }
          .event-floating-shape {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .event-section-modern {
            padding: var(--space-2xl) var(--space-xs);
          }
          .event-card-modern {
            min-width: 260px !important;
            max-width: 280px !important;
          }
        }
      `}</style>
    </section>
  );
}
