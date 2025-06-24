import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', date: '', venue: '', description: '', email: '', phone: '', image: '' });
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const location = useLocation();
  const eventRefs = useRef({});

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
      const res = await fetch('https://aau-nightlife-production.up.railway.app/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    } catch {
      setStatus('Failed to add event.');
    }
  };

  // Delete event
  const handleDelete = async idx => {
    if (!window.confirm('Delete this event?')) return;
    const updatedEvents = events.filter((_, i) => i !== idx);
    setEvents(updatedEvents);
    await fetch('https://aau-nightlife-production.up.railway.app/api/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvents)
    });
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
    await fetch('https://aau-nightlife-production.up.railway.app/api/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvents)
    });
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

  // Simple admin toggle (replace with real auth in production)
  const isAdmin = localStorage.getItem('aau_admin') === 'true';

  return (
    <section className="event-section" style={{
      minHeight: '100vh',
      padding: '0',
      margin: 0,
      boxSizing: 'border-box',
      background: '#fff',
      color: '#111',
    }}>
      <div style={{height: '2.5rem'}} />
      <div className="event-calendar-box" style={{
        background: 'rgba(35,36,74,0.98)',
        color: 'white',
        padding: '2.5rem 1.2rem 2rem 1.2rem',
        borderRadius: '18px',
        margin: '0 auto 2.5rem auto',
        maxWidth: 700,
        boxShadow: '0 4px 32px #181a2a33',
        textAlign: 'center',
      }}>
        <h2 style={{
          color: '#7bffb6',
          fontSize: '2.5rem',
          fontWeight: 800,
          marginBottom: '1.1rem',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}>Events Calendar</h2>
        <p style={{
          color: '#d2d6f6',
          fontSize: '1.2rem',
          fontWeight: 400,
          marginBottom: 0,
        }}>
          Stay up to date with the latest and upcoming student events in Ekpoma. Never miss out on the fun, networking, and opportunities happening around you!
        </p>
      </div>
      {/* Responsive style for event form and list */}
      <div style={{maxWidth: 800, margin: '0 auto', padding: '0 1rem'}}>
      {isAdmin && (
        <>
          <button onClick={() => setShowForm(f => !f)} style={{marginBottom: '1rem'}}>
            {showForm ? 'Hide Event Form' : 'Add Event'}
          </button>
          {showForm && (
            <form className="event-form" onSubmit={handleSubmit} style={{marginBottom: '2rem'}}>
              <label>
                Title:
                <input type="text" name="title" value={form.title} onChange={handleChange} required />
              </label>
              <label>
                Date:
                <input type="date" name="date" value={form.date} onChange={handleChange} required />
              </label>
              <label>
                Venue:
                <input type="text" name="venue" value={form.venue} onChange={handleChange} required />
              </label>
              <label>
                Description:
                <textarea name="description" value={form.description} onChange={handleChange} required></textarea>
              </label>
              <label>
                Contact Email:
                <input type="email" name="email" value={form.email} onChange={handleChange} />
              </label>
              <label>
                Contact Phone:
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} />
              </label>
              <label>
                Banner/Poster Image:
                <input type="file" name="image" accept="image/*" onChange={handleChange} required />
              </label>
              <button type="submit">Add Event</button>
            </form>
          )}
          {status && <p>{status}</p>}
        </>
      )}
      {loading ? <p>Loading events...</p> : (
        events.length === 0 ? <p>No events yet.</p> : (
          <ul>
            {events.map((event, idx) => (
              <>
                <li key={idx} ref={el => eventRefs.current[event.title] = el}>
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.title + ' banner'}
                      style={{
                        display: 'block',
                        width: '100%',
                        maxWidth: '600px',
                        height: 'auto',
                        maxHeight: '350px',
                        objectFit: 'contain',
                        margin: '0 auto 16px',
                        borderRadius: 12,
                        boxShadow: '0 2px 12px rgba(44,44,44,0.10)'
                      }}
                    />
                  )}
                  <strong>{event.title}</strong> <br />
                  <span>{event.date} | {event.venue}</span>
                  {event.description && event.description.split(/\r?\n/).map((para, i) =>
                    para.trim() ? <p key={i} style={{marginBottom:'1em'}}>{renderContentWithLinks(para)}</p> : null
                  )}
                  <p>Contact: <a href={`mailto:${event.email}`}>{event.email}</a> | <a href={`tel:${event.phone}`}>{event.phone}</a></p>
                  {isAdmin && editIdx === idx ? (
                    <form onSubmit={handleEditSubmit} className="event-form" style={{marginBottom: '1rem'}}>
                      <label>Title: <input type="text" name="title" value={editForm.title} onChange={handleEditChange} required /></label>
                      <label>Date: <input type="date" name="date" value={editForm.date} onChange={handleEditChange} required /></label>
                      <label>Venue: <input type="text" name="venue" value={editForm.venue} onChange={handleEditChange} required /></label>
                      <label>Description: <textarea name="description" value={editForm.description} onChange={handleEditChange} required /></label>
                      <label>Contact Email: <input type="email" name="email" value={editForm.email} onChange={handleEditChange} /></label>
                      <label>Contact Phone: <input type="tel" name="phone" value={editForm.phone} onChange={handleEditChange} /></label>
                      <label>Banner/Poster Image:
                        <input type="file" name="image" accept="image/*" onChange={handleEditChange} />
                      </label>
                      <button type="submit">Save</button>
                      <button type="button" onClick={() => setEditIdx(null)}>Cancel</button>
                    </form>
                  ) : isAdmin && (
                    <>
                      <button onClick={() => startEdit(idx)}>Edit</button>
                      <button onClick={() => handleDelete(idx)} style={{marginLeft: '0.5rem'}}>Delete</button>
                    </>
                  )}
                </li>
                {idx !== events.length - 1 && <hr className="event-divider" />}
              </>
            ))}
          </ul>
        )
      )}
      </div>
      <div style={{height: '2.5rem'}} />
    </section>
  );
}
