import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventSection.css';

export default function EventSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
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

  // Carousel logic
  useEffect(() => {
    if (events.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrent(prev => (prev + 1) % Math.min(events.length, 6));
      }, 3000);
      return () => clearInterval(intervalRef.current);
    }
  }, [events]);

  return (
    <section className="event-section">
      <h2 className="event-section-title">Featured Upcoming Events</h2>
      <div className="event-cards">
        {loading ? <p>Loading events...</p> : (
          events.length === 0 ? <p>No events yet.</p> : (
            <div className="event-card" key={events[current]?.title + events[current]?.date}>
              {events[current]?.image && (
                <img src={events[current].image} alt={events[current].title} className="event-card-img" />
              )}
              <div className="event-card-body">
                <h3 className="event-card-title">{events[current]?.title}</h3>
                <button
                  className="event-card-btn"
                  onClick={() => navigate(`/events?event=${encodeURIComponent(events[current]?.title)}`)}
                >
                  Read More
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
