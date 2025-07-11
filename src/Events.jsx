import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Events.css';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', date: '', venue: '', description: '', email: '', phone: '', image: '' });
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const location = useLocation();
  const eventRefs = useRef({});
  const { isAdmin, authenticatedFetch, isLoading: authLoading } = useAuth();

  useEffect(() => {
    fetch('https://aau-nightlife-production.up.railway.app/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  // Scroll to event if query param is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const eventTitle = params.get('event');
    if (eventTitle && eventRefs.current[eventTitle]) {
      eventRefs.current[eventTitle].scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Optionally, you can add a highlight effect here
    }
  }, [location, events]);

  const handleChange = e => {
    if (e.target.name === 'image' && e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = ev => {
        setForm(f => ({ ...f, image: ev.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('Adding...');
    try {
      const res = await authenticatedFetch('https://aau-nightlife-production.up.railway.app/api/events', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setStatus('Event added!');
        setForm({ title: '', date: '', venue: '', description: '', email: '', phone: '', image: '' });
        // Refresh events
        const updated = await fetch('https://aau-nightlife-production.up.railway.app/api/events').then(r => r.json());
        setEvents(updated);
      } else {
        setStatus('Failed to add event.');
      }
    } catch (error) {
      setStatus(error.message || 'Failed to add event.');
    }
  };

  // Delete event
  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;

    try {
      const response = await authenticatedFetch(`https://aau-nightlife-production.up.railway.app/api/events/${eventId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setEvents(events.filter(event => event._id !== eventId));
        setStatus('Event deleted successfully!');
        setTimeout(() => setStatus(''), 3000);
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setStatus('Failed to delete event.');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  // Handle edit event
  const handleEdit = (event) => {
    setForm({
      title: event.title,
      date: event.date.split('T')[0], // Convert to date input format
      venue: event.venue,
      description: event.description,
      email: event.email || '',
      phone: event.phone || '',
      image: event.image || ''
    });
    setShowForm(true);
  };

  // Edit event
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', date: '', venue: '', description: '', email: '', phone: '', image: '' });

  const startEdit = idx => {
    setEditIdx(idx);
    setEditForm(events[idx]);
  };
  const handleEditChange = e => {
    if (e.target.name === 'image' && e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = ev => {
        setEditForm(f => ({ ...f, image: ev.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    } else if (e.target.name !== 'image') {
      setEditForm({ ...editForm, [e.target.name]: e.target.value });
    }
  };
  const handleEditSubmit = async e => {
    e.preventDefault();
    const updatedEvents = events.map((ev, i) => i === editIdx ? editForm : ev);
    setEvents(updatedEvents);
    setEditIdx(null);
    try {
      await authenticatedFetch('https://aau-nightlife-production.up.railway.app/api/events', {
        method: 'PUT',
        body: JSON.stringify(updatedEvents)
      });
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  // Helper to convert [text](url) to clickable links
  function renderContentWithLinks(content) {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      parts.push(
        <a href={match[2]} target="_blank" rel="noopener noreferrer" key={key++} style={{ color: '#0074D9', textDecoration: 'underline' }}>
          {match[1]}
        </a>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }
    return parts;
  }

  // Filter events based on search term and date
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !filterDate || event.date.startsWith(filterDate);

    return matchesSearch && matchesDate;
  });

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to render description with links
  const renderDescription = (description) => {
    if (!description) return '';

    // Split by newlines and render each paragraph
    const paragraphs = description.split('\n').filter(p => p.trim());

    return paragraphs.map((paragraph, index) => (
      <span key={index}>
        {paragraph}
        {index < paragraphs.length - 1 && <br />}
      </span>
    ));
  };

  // Admin authentication now handled by AuthContext

  // Wait for auth check to complete
  if (authLoading) {
    return (
      <div className="events-loading">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="modern-events-page">
      {/* Hero Section */}
      <section className="events-hero">
        <div className="hero-content">
          <h1 className="hero-title">Discover Amazing Events</h1>
          <p className="hero-subtitle">Join the most exciting experiences at AAU</p>

          {/* Search and Filter Bar */}
          <div className="search-filter-bar">
            <div className="search-container">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Search events, venues, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-container">
              <input
                type="month"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="date-filter"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="events-main">
        <div className="container">
          {/* Admin Controls */}
          {isAdmin && (
            <div className="admin-controls">
              <h2 className="admin-title">Event Management</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="add-event-btn"
              >
                {showForm ? '✕ Cancel' : '+ Add New Event'}
              </button>
            </div>
          )}

          {/* Add Event Form */}
          {showForm && isAdmin && (
            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Event Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    required
                    className="form-input"
                    placeholder="Enter event title"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Venue</label>
                  <input
                    type="text"
                    value={form.venue}
                    onChange={(e) => setForm({...form, venue: e.target.value})}
                    required
                    className="form-input"
                    placeholder="Event venue"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({...form, image: e.target.value})}
                    className="form-input"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  required
                  className="form-textarea"
                  placeholder="Describe your event..."
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    className="form-input"
                    placeholder="contact@example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    className="form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Event
                </button>
              </div>
            </form>
          )}

          {/* Status Message */}
          {status && (
            <div className={`status-message ${status.includes('Error') ? 'error' : 'success'}`}>
              {status}
            </div>
          )}

          {/* Events Grid */}
          {loading ? (
            <div className="events-loading">
              <div className="loading-spinner"></div>
              <p>Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="empty-state">
              <h3>No events found</h3>
              <p>
                {searchTerm || filterDate
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No events are currently scheduled. Check back soon!'}
              </p>
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <div key={event._id} ref={el => eventRefs.current[event._id] = el} className="event-card">
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="event-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}

                  <div className="event-date-badge">
                    {formatDate(event.date)}
                  </div>

                  <div className="event-content">
                    <h3 className="event-title">{event.title}</h3>

                    <div className="event-venue">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      {event.venue}
                    </div>

                    <p className="event-description">
                      {renderDescription(event.description)}
                    </p>

                    {(event.email || event.phone) && (
                      <div className="event-contact">
                        {event.email && (
                          <div className="contact-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            <a href={`mailto:${event.email}`}>{event.email}</a>
                          </div>
                        )}
                        {event.phone && (
                          <div className="contact-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                            </svg>
                            <a href={`tel:${event.phone}`}>{event.phone}</a>
                          </div>
                        )}
                      </div>
                    )}

                    {isAdmin && (
                      <div className="event-actions">
                        <button
                          onClick={() => handleEdit(event)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
