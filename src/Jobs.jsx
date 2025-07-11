import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import './Jobs.css';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', sector: '', type: '', description: '', requirements: '', email: '', phone: '', location: '' });
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [editingJobIndex, setEditingJobIndex] = useState(null);
  const { isAdmin, authenticatedFetch, isLoading: authLoading } = useAuth();

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

    if (editingJobIndex !== null) {
      // Update existing job
      setStatus('Updating...');
      try {
        const updatedJobs = [...jobs];
        updatedJobs[editingJobIndex] = form;

        const res = await authenticatedFetch('https://aau-nightlife-production.up.railway.app/api/jobs', {
          method: 'PUT',
          body: JSON.stringify(updatedJobs)
        });
        if (res.ok) {
          setStatus('Job updated!');
          setJobs(updatedJobs);
          setForm({ title: '', sector: '', type: '', description: '', requirements: '', email: '', phone: '', location: '' });
          setShowForm(false);
          setEditingJobIndex(null);
        } else {
          setStatus('Failed to update job.');
        }
      } catch (error) {
        setStatus(error.message || 'Failed to update job.');
      }
    } else {
      // Add new job
      setStatus('Adding...');
      try {
        const res = await authenticatedFetch('https://aau-nightlife-production.up.railway.app/api/jobs', {
          method: 'POST',
          body: JSON.stringify(form)
        });
        if (res.ok) {
          setStatus('Job added!');
          setForm({ title: '', sector: '', type: '', description: '', requirements: '', email: '', phone: '', location: '' });
          setShowForm(false);
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

  // Handle edit job (for new design)
  const handleEdit = (index) => {
    const job = jobs[index];
    setForm({
      title: job.title,
      sector: job.sector,
      type: job.type,
      description: job.description,
      requirements: job.requirements || '',
      email: job.email || '',
      phone: job.phone || '',
      location: job.location || ''
    });
    setEditingJobIndex(index);
    setShowForm(true);
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

  // Filter jobs based on search term and type
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = !filterType || job.type.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesType;
  });

  // Helper function to render requirements
  const renderRequirements = (requirements) => {
    if (!requirements) return null;

    const reqList = requirements.split('\n').filter(req => req.trim());
    if (reqList.length === 0) return null;

    return (
      <div className="job-requirements">
        <h4>Requirements:</h4>
        <ul>
          {reqList.map((req, index) => (
            <li key={index}>{req.trim()}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Admin authentication now handled by AuthContext

  // Wait for auth check to complete
  if (authLoading) {
    return (
      <div className="jobs-loading">
        <div className="jobs-loading-spinner"></div>
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="modern-jobs-page">
      {/* Hero Section */}
      <section className="jobs-hero">
        <div className="jobs-hero-content">
          <h1 className="jobs-hero-title">Find Your Dream Job</h1>
          <p className="jobs-hero-subtitle">Discover exciting career opportunities at AAU and beyond</p>

          {/* Search and Filter Bar */}
          <div className="jobs-search-filter-bar">
            <div className="jobs-search-container">
              <svg className="jobs-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Search jobs, companies, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="jobs-search-input"
              />
            </div>

            <div className="jobs-filter-container">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="jobs-type-filter"
              >
                <option value="">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="jobs-main">
        <div className="jobs-container">
          {/* Admin Controls */}
          {isAdmin && (
            <div className="jobs-admin-controls">
              <h2 className="jobs-admin-title">Job Management</h2>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (showForm) {
                    setEditingJobIndex(null);
                    setForm({ title: '', sector: '', type: '', description: '', requirements: '', email: '', phone: '', location: '' });
                  }
                }}
                className="add-job-btn"
              >
                {showForm ? '✕ Cancel' : '+ Add New Job'}
              </button>
            </div>
          )}

          {/* Add Job Form */}
          {showForm && isAdmin && (
            <form onSubmit={handleSubmit} className="job-form">
              <h3 style={{ marginBottom: '1.5rem', color: '#1f2937', fontSize: '1.25rem', fontWeight: '700' }}>
                {editingJobIndex !== null ? 'Edit Job' : 'Add New Job'}
              </h3>
              <div className="job-form-grid">
                <div className="job-form-group">
                  <label className="job-form-label">Job Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    required
                    className="job-form-input"
                    placeholder="Enter job title"
                  />
                </div>

                <div className="job-form-group">
                  <label className="job-form-label">Company/Sector</label>
                  <input
                    type="text"
                    value={form.sector}
                    onChange={(e) => setForm({...form, sector: e.target.value})}
                    required
                    className="job-form-input"
                    placeholder="Company or sector"
                  />
                </div>

                <div className="job-form-group">
                  <label className="job-form-label">Job Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({...form, type: e.target.value})}
                    required
                    className="job-form-select"
                  >
                    <option value="">Select type</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                <div className="job-form-group">
                  <label className="job-form-label">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({...form, location: e.target.value})}
                    className="job-form-input"
                    placeholder="Job location"
                  />
                </div>
              </div>

              <div className="job-form-group">
                <label className="job-form-label">Job Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  required
                  className="job-form-textarea"
                  placeholder="Describe the job role and responsibilities..."
                />
              </div>

              <div className="job-form-group">
                <label className="job-form-label">Requirements (one per line)</label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => setForm({...form, requirements: e.target.value})}
                  className="job-form-textarea"
                  placeholder="List job requirements, one per line..."
                />
              </div>

              <div className="job-form-grid">
                <div className="job-form-group">
                  <label className="job-form-label">Contact Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    className="job-form-input"
                    placeholder="contact@company.com"
                  />
                </div>

                <div className="job-form-group">
                  <label className="job-form-label">Contact Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    className="job-form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="job-form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="job-cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="job-submit-btn">
                  {editingJobIndex !== null ? 'Update Job' : 'Post Job'}
                </button>
              </div>
            </form>
          )}

          {/* Status Message */}
          {status && (
            <div className={`jobs-status-message ${status.includes('Error') ? 'error' : 'success'}`}>
              {status}
            </div>
          )}

          {/* Jobs Grid */}
          {loading ? (
            <div className="jobs-loading">
              <div className="jobs-loading-spinner"></div>
              <p>Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="jobs-empty-state">
              <h3>No jobs found</h3>
              <p>
                {searchTerm || filterType
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No jobs are currently available. Check back soon!'}
              </p>
            </div>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map((job, index) => (
                <div key={job._id || index} className="job-card">
                  <div className="job-header">
                    <h3 className="job-title">{job.title}</h3>
                    <span className="job-type-badge">{job.type}</span>
                  </div>

                  <div className="job-company">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                    </svg>
                    {job.sector}
                  </div>

                  {job.location && (
                    <div className="job-location">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      {job.location}
                    </div>
                  )}

                  <p className="job-description">{job.description}</p>

                  {renderRequirements(job.requirements)}

                  {(job.email || job.phone) && (
                    <div className="job-contact">
                      {job.email && (
                        <div className="job-contact-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                          <a href={`mailto:${job.email}`}>{job.email}</a>
                        </div>
                      )}
                      {job.phone && (
                        <div className="job-contact-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                          </svg>
                          <a href={`tel:${job.phone}`}>{job.phone}</a>
                        </div>
                      )}
                    </div>
                  )}

                  {isAdmin && (
                    <div className="job-actions">
                      <button
                        onClick={() => handleEdit(index)}
                        className="job-edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="job-delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
