import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', sector: '', type: '', description: '', email: '', phone: '' });
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { isAdmin, authenticatedFetch } = useAuth();

  useEffect(() => {
    fetch('https://aau-nightlife-production.up.railway.app/api/jobs')
      .then(res => res.json())
      .then(data => {
        // Sort jobs by _id in descending order (newest first)
        const sortedJobs = data.sort((a, b) => {
          if (a._id && b._id) {
            return b._id.localeCompare(a._id);
          }
          return 0;
        });
        setJobs(sortedJobs);
        setLoading(false);
      });
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('Adding...');
    try {
      const res = await authenticatedFetch('https://aau-nightlife-production.up.railway.app/api/jobs', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setStatus('Job added!');
        setForm({ title: '', sector: '', type: '', description: '', email: '', phone: '' });
        // Refresh jobs
        const updated = await fetch('https://aau-nightlife-production.up.railway.app/api/jobs').then(r => r.json());
        // Sort jobs by _id in descending order (newest first)
        const sortedJobs = updated.sort((a, b) => {
          if (a._id && b._id) {
            return b._id.localeCompare(a._id);
          }
          return 0;
        });
        setJobs(sortedJobs);
      } else {
        setStatus('Failed to add job.');
      }
    } catch (error) {
      setStatus(error.message || 'Failed to add job.');
    }
  };

  // Delete job
  const handleDelete = async idx => {
    if (!window.confirm('Delete this job posting?')) return;
    const updatedJobs = jobs.filter((_, i) => i !== idx);
    setJobs(updatedJobs);
    try {
      await authenticatedFetch('https://aau-nightlife-production.up.railway.app/api/jobs', {
        method: 'PUT',
        body: JSON.stringify(updatedJobs)
      });
    } catch (error) {
      console.error('Failed to delete job:', error);
      // Revert the change if the API call failed
      setJobs(jobs);
    }
  };

  // Edit job
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', sector: '', type: '', description: '', email: '', phone: '' });

  const startEdit = idx => {
    setEditIdx(idx);
    setEditForm(jobs[idx]);
  };
  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEditSubmit = async e => {
    e.preventDefault();
    const updatedJobs = jobs.map((job, i) => i === editIdx ? editForm : job);
    setJobs(updatedJobs);
    setEditIdx(null);
    try {
      await authenticatedFetch('https://aau-nightlife-production.up.railway.app/api/jobs', {
        method: 'PUT',
        body: JSON.stringify(updatedJobs)
      });
    } catch (error) {
      console.error('Failed to update job:', error);
    }
  };

  // Admin authentication now handled by AuthContext

  return (
    <section className="jobs-section" style={{
      minHeight: '100vh',
      padding: 0,
      margin: 0,
      boxSizing: 'border-box',
      background: '#fff',
      color: '#111',
    }}>
      <div style={{height: '2.5rem'}} />
      <div className="jobs-calendar-box" style={{
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
        }}>Jobs Board</h2>
        <p style={{
          color: '#d2d6f6',
          fontSize: '1.2rem',
          fontWeight: 400,
          marginBottom: 0,
        }}>
          Discover the latest job opportunities for students in Ekpoma. Find part-time, full-time, and internship positions to support your academic journey!
        </p>
      </div>
      <div style={{maxWidth: 800, margin: '0 auto', padding: '0 1rem'}}>
        {isAdmin && (
          <>
            <button onClick={() => setShowForm(f => !f)} style={{marginBottom: '1rem'}}>
              {showForm ? 'Hide Job Form' : 'Add Job'}
            </button>
            {showForm && (
              <form className="job-form" onSubmit={handleSubmit} style={{marginBottom: '2rem'}}>
                <label>
                  Title:
                  <input type="text" name="title" value={form.title} onChange={handleChange} required />
                </label>
                <label>
                  Sector:
                  <input type="text" name="sector" value={form.sector} onChange={handleChange} required />
                </label>
                <label>
                  Type:
                  <input type="text" name="type" value={form.type} onChange={handleChange} required />
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
                <button type="submit">Add Job</button>
              </form>
            )}
            {status && <p style={{color: '#7bffb6'}}>{status}</p>}
          </>
        )}
        {loading ? <p style={{color: '#fff'}}>Loading jobs...</p> : (
          jobs.length === 0 ? <p style={{color: '#fff'}}>No jobs yet.</p> : (
            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
              {jobs.map((job, idx) => (
                <li key={idx} style={{
                  background: '#23244a',
                  color: '#fff',
                  borderRadius: '14px',
                  boxShadow: '0 2px 12px rgba(44,44,44,0.10)',
                  marginBottom: '2rem',
                  padding: '2rem 1.5rem',
                  maxWidth: 700,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  border: '1px solid #2d2d6e',
                }}>
                  {isAdmin && editIdx === idx ? (
                    <form onSubmit={handleEditSubmit} className="job-form" style={{marginBottom: '1rem'}}>
                      <label>Title: <input type="text" name="title" value={editForm.title} onChange={handleEditChange} required /></label>
                      <label>Sector: <input type="text" name="sector" value={editForm.sector} onChange={handleEditChange} required /></label>
                      <label>Type: <input type="text" name="type" value={editForm.type} onChange={handleEditChange} required /></label>
                      <label>Description: <textarea name="description" value={editForm.description} onChange={handleEditChange} required /></label>
                      <label>Contact Email: <input type="email" name="email" value={editForm.email} onChange={handleEditChange} /></label>
                      <label>Contact Phone: <input type="tel" name="phone" value={editForm.phone} onChange={handleEditChange} /></label>
                      <button type="submit">Save</button>
                      <button type="button" onClick={() => setEditIdx(null)}>Cancel</button>
                    </form>
                  ) : isAdmin && (
                    <>
                      <button onClick={() => startEdit(idx)} style={{marginRight: '0.5rem'}}>Edit</button>
                      <button onClick={() => handleDelete(idx)} style={{marginLeft: '0.5rem'}}>Delete</button>
                    </>
                  )}
                  <strong style={{fontSize: '1.3rem', color: '#7bffb6'}}>{job.title}</strong> <br />
                  <span style={{color: '#d2d6f6'}}>{job.sector} | {job.type}</span>
                  <p style={{margin: '1rem 0', color: '#fff', whiteSpace: 'pre-line'}}>{job.description}</p>
                  <p style={{margin: 0}}>
                    <span style={{color: '#7bffb6'}}>Contact:</span> <a href={`mailto:${job.email}`} style={{color: '#7bffb6'}}>{job.email}</a> | <a href={`tel:${job.phone}`} style={{color: '#7bffb6'}}>{job.phone}</a>
                  </p>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
      <div style={{height: '2.5rem'}} />
    </section>
  );
}
