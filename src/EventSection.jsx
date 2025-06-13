import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventSection.css';

export default function EventSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://aau-nightlife-production.up.railway.app/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  return (
    <section className="event-section">
      <h2 className="event-section-title">Featured Upcoming Events</h2>
      <div className="event-cards">
        {loading ? <p>Loading events...</p> : (
          events.length === 0 ? <p>No events yet.</p> : (
            events.slice(0, 6).map(event => (
              <div className="event-card" key={event.title + event.date}>
                {event.image && (
                  <img src={event.image} alt={event.title} className="event-card-img" />
                )}
                <div className="event-card-body">
                  <h3 className="event-card-title">{event.title}</h3>
                  <p className="event-card-desc">{event.description}</p>
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
    </section>
  );
}
