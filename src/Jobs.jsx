import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { API_ENDPOINTS } from './config';
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
    fetch(API_ENDPOINTS.jobs)
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

        const res = await authenticatedFetch(API_ENDPOINTS.jobs, {
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
        const res = await authenticatedFetch(API_ENDPOINTS.jobs, {
          method: 'POST',
          body: JSON.stringify(form)
        });
        if (res.ok) {
          setStatus('Job added!');
          setForm({ title: '', sector: '', type: '', description: '', requirements: '', email: '', phone: '', location: '' });
          setShowForm(false);
          // Refresh jobs
          const updated = await fetch(API_ENDPOINTS.jobs).then(r => r.json());
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
      await authenticatedFetch(API_ENDPOINTS.jobs, {
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
      await authenticatedFetch(API_ENDPOINTS.jobs, {
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
      <div className="job-requirements-modern">
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
      {/* Artistic Hero Section */}
      <section className="jobs-hero-modern">
        <div className="jobs-hero-background-effects">
          <div className="jobs-floating-shape shape-1"></div>
          <div className="jobs-floating-shape shape-2"></div>
          <div className="jobs-floating-shape shape-3"></div>
          <div className="jobs-floating-shape shape-4"></div>
        </div>

        <div className="jobs-hero-content-modern">
          <div className="jobs-hero-text-container">
            <h1 className="jobs-hero-title-modern">
              <span className="jobs-title-line-1">Find Your</span>
              <span className="jobs-title-line-2">Dream Job</span>
            </h1>
            <p className="jobs-hero-subtitle-modern">
              Discover exciting career opportunities at AAU and beyond
            </p>
          </div>

          {/* Modern Search and Filter Bar */}
          <div className="jobs-search-filter-modern">
            <div className="jobs-search-container-modern">
              <div className="jobs-search-input-wrapper">
                <svg className="jobs-search-icon-modern" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Search jobs, companies, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="jobs-search-input-modern"
                />
              </div>
            </div>

            <div className="jobs-filter-container-modern">
              <div className="jobs-select-wrapper">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="jobs-type-filter-modern"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="full-time/part-time">Full Time/Part Time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
                <svg className="jobs-select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Main Content */}
      <main className="jobs-main-modern">
        <div className="jobs-container-modern">
          {/* Modern Admin Controls */}
          {isAdmin && (
            <div className="jobs-admin-controls-modern">
              <div className="jobs-admin-header">
                <h2 className="jobs-admin-title-modern">Job Management</h2>
                <div className="jobs-admin-badge">Admin Panel</div>
              </div>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (showForm) {
                    setEditingJobIndex(null);
                    setForm({ title: '', sector: '', type: '', description: '', requirements: '', email: '', phone: '', location: '' });
                  }
                }}
                className="add-job-btn-modern"
              >
                <span className="jobs-btn-icon">{showForm ? '✕' : '+'}</span>
                <span className="jobs-btn-text">{showForm ? 'Cancel' : 'Add New Job'}</span>
              </button>
            </div>
          )}

          {/* Add Job Form */}
          {showForm && isAdmin && (
            <form onSubmit={handleSubmit} className="job-form">
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
                    <option value="full-time/part-time">Full Time/Part Time</option>
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
                  className="job-form-textarea"
                  placeholder="Describe the job role and responsibilities... (Press Enter for new line, Shift+Enter for paragraph break)"
                  style={{ whiteSpace: 'pre-wrap' }}
                />
              </div>

              <div className="job-form-group">
                <label className="job-form-label">Requirements (one per line)</label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => setForm({...form, requirements: e.target.value})}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      const textarea = e.target;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const newValue = form.requirements.substring(0, start) + '\n' + form.requirements.substring(end);
                      setForm({...form, requirements: newValue});
                      // Set cursor position after the new line
                      setTimeout(() => {
                        textarea.selectionStart = textarea.selectionEnd = start + 1;
                      }, 0);
                    }
                  }}
                  className="job-form-textarea"
                  placeholder="List job requirements, one per line... (Press Enter for new line, Shift+Enter for paragraph break)"
                  style={{ whiteSpace: 'pre-wrap' }}
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
            <div className="jobs-grid-modern">
              {filteredJobs.map((job, index) => (
                <div key={job._id || index} className="job-card-modern">
                  <div className="job-card-header-modern">
                    <div className="job-header-content">
                      <h3 className="job-title-modern">{job.title}</h3>
                      <span className="job-type-badge-modern">{job.type}</span>
                    </div>
                  </div>

                  <div className="job-meta-info">
                    <div className="job-company-modern">
                      <svg className="job-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                      </svg>
                      <span className="job-company-text">{job.sector}</span>
                    </div>

                    {job.location && (
                      <div className="job-location-modern">
                        <svg className="job-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        <span className="job-location-text">{job.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="job-content-section">
                    <div className="job-description-modern">
                      {job.description}
                    </div>

                    {renderRequirements(job.requirements)}

                    {(job.email || job.phone) && (
                      <div className="job-contact-modern">
                        {job.email && (
                          <div className="job-contact-item-modern">
                            <svg className="contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            <a href={`mailto:${job.email}`} className="contact-link">{job.email}</a>
                          </div>
                        )}
                        {job.phone && (
                          <div className="job-contact-item-modern">
                            <svg className="contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                            </svg>
                            <a href={`tel:${job.phone}`} className="contact-link">{job.phone}</a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="job-actions-modern">
                      <button
                        onClick={() => handleEdit(index)}
                        className="job-edit-btn-modern"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="job-delete-btn-modern"
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
