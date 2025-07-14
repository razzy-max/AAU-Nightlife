import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { API_ENDPOINTS } from './config';
import './Events.css';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', date: '', venue: '', description: '', email: '', phone: '', image: '' });
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);
  const location = useLocation();
  const eventRefs = useRef({});
  const { isAdmin, authenticatedFetch, isLoading: authLoading } = useAuth();

  useEffect(() => {
    fetch(API_ENDPOINTS.events)
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

    if (editingEventId) {
      // Update existing event
      setStatus('Updating...');
      try {
        // Find the event index and update the events array
        const eventIndex = events.findIndex(event => event._id === editingEventId);
        if (eventIndex !== -1) {
          const updatedEvents = [...events];
          updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], ...form };

          // Send updated events array to backend
          const res = await authenticatedFetch(API_ENDPOINTS.events, {
            method: 'PUT',
            body: JSON.stringify(updatedEvents)
          });

          if (res.ok) {
            setStatus('Event updated!');
            setEvents(updatedEvents);
            setForm({ title: '', date: '', venue: '', description: '', email: '', phone: '', image: '' });
            setShowForm(false);
            setEditingEventId(null);
          } else {
            setStatus('Failed to update event.');
          }
        }
      } catch (error) {
        setStatus(error.message || 'Failed to update event.');
      }
    } else {
      // Add new event
      setStatus('Adding...');
      try {
        const res = await authenticatedFetch(API_ENDPOINTS.events, {
          method: 'POST',
          body: JSON.stringify(form)
        });
        if (res.ok) {
          setStatus('Event added!');
          setForm({ title: '', date: '', venue: '', description: '', email: '', phone: '', image: '' });
          setShowForm(false);
          // Refresh events
          const updated = await fetch(API_ENDPOINTS.events).then(r => r.json());
          setEvents(updated);
        } else {
          setStatus('Failed to add event.');
        }
      } catch (error) {
        setStatus(error.message || 'Failed to add event.');
      }
    }
  };

  // Delete event
  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;

    try {
      const response = await authenticatedFetch(`${API_ENDPOINTS.events}/${eventId}`, {
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
    // Convert date to datetime-local format
    let dateValue = '';
    if (event.date) {
      const date = new Date(event.date);
      dateValue = date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
    }

    setForm({
      title: event.title,
      date: dateValue,
      venue: event.venue,
      description: event.description,
      email: event.email || '',
      phone: event.phone || '',
      image: event.image || ''
    });
    setEditingEventId(event._id);
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
      await authenticatedFetch(API_ENDPOINTS.events, {
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

  // Helper function to render description with links and line breaks
  const renderDescription = (description) => {
    if (!description) return '';

    // Split by newlines and render each line
    const lines = description.split('\n');

    return lines.map((line, index) => (
      <span key={index}>
        {line}
        {index < lines.length - 1 && <br />}
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
      {/* Artistic Hero Section */}
      <section className="events-hero-modern">
        <div className="hero-background-effects">
          <div className="floating-orb orb-1"></div>
          <div className="floating-orb orb-2"></div>
          <div className="floating-orb orb-3"></div>
        </div>

        <div className="events-hero-content">
          <div className="hero-text-container">
            <h1 className="events-title-modern">
              <span className="title-line-1">Discover</span>
              <span className="title-line-2">Amazing Events</span>
            </h1>
            <p className="events-subtitle-modern">
              Join the most exciting experiences at AAU Ekpoma
            </p>
          </div>

          {/* Modern Search and Filter Bar */}
          <div className="search-filter-modern">
            <div className="search-container-modern">
              <div className="search-input-wrapper">
                <svg className="search-icon-modern" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Search events, venues, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input-modern"
                />
              </div>
            </div>

            <div className="filter-container-modern">
              <input
                type="month"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="date-filter-modern"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modern Main Content */}
      <main className="events-main-modern">
        <div className="events-container-modern">
          {/* Modern Admin Controls */}
          {isAdmin && (
            <div className="admin-controls-modern">
              <div className="admin-header">
                <h2 className="admin-title-modern">Event Management</h2>
                <div className="admin-badge">Admin Panel</div>
              </div>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (showForm) {
                    setEditingEventId(null);
                    setForm({ title: '', date: '', venue: '', description: '', email: '', phone: '', image: '' });
                  }
                }}
                className="add-event-btn-modern"
              >
                <span className="btn-icon">{showForm ? '✕' : '+'}</span>
                <span className="btn-text">{showForm ? 'Cancel' : 'Add New Event'}</span>
              </button>
            </div>
          )}

          {/* Modern Add Event Form */}
          {showForm && isAdmin && (
            <form onSubmit={handleSubmit} className="event-form-modern">
              <div className="form-header-modern">
                <h3 className="form-title-modern">
                  {editingEventId ? 'Edit Event' : 'Create New Event'}
                </h3>
                <p className="form-subtitle-modern">
                  Fill in the details below to {editingEventId ? 'update' : 'create'} an event
                </p>
              </div>
              <div className="form-grid-modern">
                <div className="form-group-modern">
                  <label className="form-label-modern">Event Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    required
                    className="form-input-modern"
                    placeholder="Enter event title"
                  />
                </div>

                <div className="form-group-modern">
                  <label className="form-label-modern">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    required
                    className="form-input-modern"
                  />
                </div>

                <div className="form-group-modern">
                  <label className="form-label-modern">Venue</label>
                  <input
                    type="text"
                    value={form.venue}
                    onChange={(e) => setForm({...form, venue: e.target.value})}
                    required
                    className="form-input-modern"
                    placeholder="Event venue"
                  />
                </div>

                <div className="form-group-modern">
                  <label className="form-label-modern">Event Image</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="form-input-modern"
                    style={{ padding: '0.5rem' }}
                  />
                  {form.image && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <img
                        src={form.image}
                        alt="Preview"
                        style={{
                          maxWidth: '200px',
                          maxHeight: '150px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group-modern">
                <label className="form-label-modern">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      const textarea = e.target;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const newValue = form.description.substring(0, start) + '\n' + form.description.substring(end);
                      setForm({...form, description: newValue});
                      // Set cursor position after the new line
                      setTimeout(() => {
                        textarea.selectionStart = textarea.selectionEnd = start + 1;
                      }, 0);
                    }
                  }}
                  required
                  className="form-input-modern"
                  placeholder="Describe your event... (Press Enter for new line, Shift+Enter for paragraph break)"
                  style={{ whiteSpace: 'pre-wrap', minHeight: '120px', resize: 'vertical' }}
                />
              </div>

              <div className="form-grid-modern">
                <div className="form-group-modern">
                  <label className="form-label-modern">Contact Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    className="form-input-modern"
                    placeholder="contact@example.com"
                  />
                </div>

                <div className="form-group-modern">
                  <label className="form-label-modern">Contact Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    className="form-input-modern"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingEventId ? 'Update Event' : 'Create Event'}
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
            <div className="events-grid-modern">
              {filteredEvents.map((event) => (
                <div key={event._id} ref={el => eventRefs.current[event._id] = el} className="event-card-modern">
                  <div className="event-card-header">
                    {event.image && (
                      <div className="event-image-container">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="event-image-modern"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="image-overlay"></div>
                      </div>
                    )}

                    <div className="event-date-badge-modern">
                      <span className="date-text">{formatDate(event.date)}</span>
                    </div>
                  </div>

                  <div className="event-content-modern">
                    <h3 className="event-title-modern">{event.title}</h3>

                    <div className="event-venue-modern">
                      <svg className="venue-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <span className="venue-text">{event.venue}</span>
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
