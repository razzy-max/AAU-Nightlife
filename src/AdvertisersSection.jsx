import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { API_ENDPOINTS } from './config';
import './AdvertisersSection.css';

export default function AdvertisersSection() {
  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, authenticatedFetch, isLoading: authLoading } = useAuth();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    media: '',
    mediaType: 'image',
    link: '',
    description: '',
    facebook: '',
    instagram: '',
    whatsapp: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Edit functionality state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    media: '',
    mediaType: 'image',
    link: '',
    description: '',
    facebook: '',
    instagram: '',
    whatsapp: ''
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef(null);

  const fetchAdvertisers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.advertisers);
      if (!res.ok) throw new Error('Failed to fetch advertisers');
      const data = await res.json();
      setAdvertisers(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Carousel functionality
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % advertisers.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + advertisers.length) % advertisers.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && advertisers.length > 1) {
      intervalRef.current = setInterval(nextSlide, 4000); // 4 seconds delay
      return () => clearInterval(intervalRef.current);
    }
  }, [isPlaying, advertisers.length]);

  // Pause/resume on hover
  const handleMouseEnter = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleMouseLeave = () => {
    setIsPlaying(true);
  };

  useEffect(() => {
    fetchAdvertisers();
  }, []);

  // Handle file uploads for both images and videos
  const handleFileUpload = (file, setFormFunction) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      setFormFunction((f) => ({
        ...f,
        media: ev.target.result,
        mediaType: mediaType
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    if (e.target.name === 'media' && e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0], setForm);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleEditChange = (e) => {
    if (e.target.name === 'media' && e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0], setEditForm);
    } else {
      setEditForm({ ...editForm, [e.target.name]: e.target.value });
    }
  };

  const handleAddAdvertiser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.advertisers, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to add advertiser');
      setForm({
        name: '',
        media: '',
        mediaType: 'image',
        link: '',
        description: '',
        facebook: '',
        instagram: '',
        whatsapp: ''
      });
      setShowForm(false);
      fetchAdvertisers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit functionality
  const startEdit = (advertiser) => {
    setEditingId(advertiser._id || advertiser.id);
    setEditForm({
      name: advertiser.name || '',
      media: advertiser.media || advertiser.logo || '', // Support legacy 'logo' field
      mediaType: advertiser.mediaType || 'image',
      link: advertiser.link || '',
      description: advertiser.description || '',
      facebook: advertiser.facebook || '',
      instagram: advertiser.instagram || '',
      whatsapp: advertiser.whatsapp || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: '',
      media: '',
      mediaType: 'image',
      link: '',
      description: '',
      facebook: '',
      instagram: '',
      whatsapp: ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      const res = await authenticatedFetch(`${API_ENDPOINTS.advertisers}/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Failed to update advertiser');
      cancelEdit();
      fetchAdvertisers();
    } catch (err) {
      setError(err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteAdvertiser = async (id) => {
    if (!window.confirm('Delete this advertiser?')) return;
    try {
      const res = await authenticatedFetch(`${API_ENDPOINTS.advertisers}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete advertiser');
      fetchAdvertisers();
    } catch (err) {
      setError(err.message);
    }
  };

  // Placeholder data for testing when no advertisers exist
  const placeholderData = [
    {
      _id: 'placeholder1',
      name: 'Sample Restaurant',
      media: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjN2JmZmI2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMjIyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5SRVNUQVVSQU5UPC90ZXh0Pgo8L3N2Zz4K',
      mediaType: 'image',
      description: 'Delicious local cuisine and amazing atmosphere. Visit us for the best dining experience in town!',
      link: 'https://example.com',
      facebook: 'https://facebook.com/samplerestaurant',
      instagram: 'https://instagram.com/samplerestaurant',
      whatsapp: 'https://wa.me/2349037558818'
    },
    {
      _id: 'placeholder2',
      name: 'Tech Solutions',
      media: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDA3YmZmIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5URUNIIFNPTFVUSU9OUzwvdGV4dD4KPC9zdmc+Cg==',
      mediaType: 'image',
      description: 'Professional IT services and digital solutions for your business needs. Contact us today!',
      link: 'https://example.com',
      facebook: 'https://facebook.com/techsolutions',
      instagram: 'https://instagram.com/techsolutions',
      whatsapp: 'https://wa.me/2349037558818'
    },
    {
      _id: 'placeholder3',
      name: 'Video Marketing Agency',
      media: '', // No media for demonstration
      mediaType: 'video',
      description: 'Creative video content and marketing solutions for your brand.',
      link: '', // No website link for demonstration
      facebook: 'https://facebook.com/videoagency',
      instagram: '',
      whatsapp: 'https://wa.me/2349037558818'
    }
  ];

  // Use real data if available, otherwise use placeholder data for demonstration
  const displayData = advertisers.length > 0 ? advertisers : placeholderData;

  // Debug logging
  console.log('AdvertisersSection component - isAdmin:', isAdmin, 'authLoading:', authLoading);

  return (
    <section className="advertisers-section">
      <div className="advertisers-container">
        <h2 className="advertisers-title">Featured Advertisers</h2>
        <p className="advertisers-subtext">Discover amazing Worldclass businesses and services</p>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="admin-controls">
            <button
              className="admin-toggle-btn"
              onClick={() => setShowForm((f) => !f)}
            >
              {showForm ? 'Hide Add Advertiser' : 'Add Advertiser'}
            </button>
            {showForm && (
              <form className="advertiser-add-form" onSubmit={handleAddAdvertiser}>
                <div className="form-row">
                  <input
                    type="text"
                    name="name"
                    placeholder="Business Name *"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="url"
                    name="link"
                    placeholder="Website URL (optional)"
                    value={form.link}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    name="description"
                    placeholder="Short description (optional)"
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="url"
                    name="facebook"
                    placeholder="Facebook URL (optional)"
                    value={form.facebook}
                    onChange={handleChange}
                  />
                  <input
                    type="url"
                    name="instagram"
                    placeholder="Instagram URL (optional)"
                    value={form.instagram}
                    onChange={handleChange}
                  />
                  <input
                    type="url"
                    name="whatsapp"
                    placeholder="WhatsApp URL (optional, e.g., https://wa.me/234...)"
                    value={form.whatsapp}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="file"
                    name="media"
                    accept="image/*,video/*"
                    onChange={handleChange}
                  />
                  {form.media && (
                    <div className="media-preview">
                      {form.mediaType === 'video' ? (
                        <video
                          src={form.media}
                          className="media-preview-element"
                          controls
                          muted
                        />
                      ) : (
                        <img
                          src={form.media}
                          alt="Preview"
                          className="media-preview-element"
                        />
                      )}
                    </div>
                  )}
                </div>
                <button type="submit" disabled={submitting} className="submit-btn">
                  {submitting ? 'Adding...' : 'Add Advertiser'}
                </button>
              </form>
            )}
            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {/* Carousel Section */}
        {loading ? (
          <div className="carousel-loading">
            <div className="loading-spinner"></div>
            <p>Loading advertisers...</p>
          </div>
        ) : (
          <div className="carousel-wrapper">
            {displayData.length > 0 ? (
              <div
                className="carousel-container"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {/* Navigation Arrows */}
                {displayData.length > 1 && (
                  <>
                    <button
                      className="carousel-nav carousel-nav-prev"
                      onClick={prevSlide}
                      aria-label="Previous advertisement"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                      </svg>
                    </button>
                    <button
                      className="carousel-nav carousel-nav-next"
                      onClick={nextSlide}
                      aria-label="Next advertisement"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                      </svg>
                    </button>
                  </>
                )}

                {/* Carousel Slides */}
                <div className="carousel-slides">
                  {displayData.map((adv, index) => (
                    <div
                      key={adv._id || adv.id || index}
                      className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                    >
                      {editingId === (adv._id || adv.id) ? (
                        /* Edit Form */
                        <div className="slide-edit-form">
                          <form onSubmit={handleEditSubmit} className="edit-form">
                            <h3>Edit Advertiser</h3>
                            <div className="form-row">
                              <input
                                type="text"
                                name="name"
                                placeholder="Business Name *"
                                value={editForm.name}
                                onChange={handleEditChange}
                                required
                              />
                              <input
                                type="url"
                                name="link"
                                placeholder="Website URL (optional)"
                                value={editForm.link}
                                onChange={handleEditChange}
                              />
                            </div>
                            <div className="form-row">
                              <input
                                type="text"
                                name="description"
                                placeholder="Short description (optional)"
                                value={editForm.description}
                                onChange={handleEditChange}
                              />
                            </div>
                            <div className="form-row">
                              <input
                                type="url"
                                name="facebook"
                                placeholder="Facebook URL (optional)"
                                value={editForm.facebook}
                                onChange={handleEditChange}
                              />
                              <input
                                type="url"
                                name="instagram"
                                placeholder="Instagram URL (optional)"
                                value={editForm.instagram}
                                onChange={handleEditChange}
                              />
                            </div>
                            <div className="form-row">
                              <input
                                type="url"
                                name="whatsapp"
                                placeholder="WhatsApp URL (optional)"
                                value={editForm.whatsapp}
                                onChange={handleEditChange}
                              />
                            </div>
                            <div className="form-row">
                              <input
                                type="file"
                                name="media"
                                accept="image/*,video/*"
                                onChange={handleEditChange}
                              />
                              {editForm.media && (
                                <div className="media-preview">
                                  {editForm.mediaType === 'video' ? (
                                    <video
                                      src={editForm.media}
                                      className="media-preview-element"
                                      controls
                                      muted
                                    />
                                  ) : (
                                    <img
                                      src={editForm.media}
                                      alt="Preview"
                                      className="media-preview-element"
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="edit-form-buttons">
                              <button type="submit" disabled={editSubmitting} className="save-btn">
                                {editSubmitting ? 'Saving...' : 'Save Changes'}
                              </button>
                              <button type="button" onClick={cancelEdit} className="cancel-btn">
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        /* Normal Slide Display */
                        <div className="slide-content">
                          {/* Media Section */}
                          <div className="slide-media">
                            {(adv.media || adv.logo) ? (
                              (adv.mediaType === 'video' || (adv.media && adv.media.startsWith('data:video'))) ? (
                                <video
                                  src={adv.media || adv.logo}
                                  alt={adv.name}
                                  controls
                                  autoPlay
                                  muted
                                  loop
                                  className="slide-video"
                                />
                              ) : (
                                <img
                                  src={adv.media || adv.logo}
                                  alt={adv.name}
                                  className="slide-image"
                                />
                              )
                            ) : (
                              <div className="slide-no-media">
                                <div className="no-media-placeholder">
                                  <span>📷</span>
                                  <p>No media</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Content Section */}
                          <div className="slide-info">
                            <h3 className="slide-title">{adv.name}</h3>

                            {/* Mobile Header Layout - Social Links and Visit Button */}
                            <div className="slide-social">
                              <div className="social-links-group">
                                {adv.facebook && (
                                  <a
                                    href={adv.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link facebook"
                                    aria-label="Facebook"
                                  >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                  </a>
                                )}
                                {adv.instagram && (
                                  <a
                                    href={adv.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link instagram"
                                    aria-label="Instagram"
                                  >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                  </a>
                                )}
                                {adv.whatsapp && (
                                  <a
                                    href={adv.whatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link whatsapp"
                                    aria-label="WhatsApp"
                                  >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                    </svg>
                                  </a>
                                )}
                              </div>
                              {adv.link && (
                                <a
                                  href={adv.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="visit-website-btn"
                                >
                                  Visit Business
                                </a>
                              )}
                            </div>

                            <p className="slide-description">
                              {adv.description || 'Discover amazing products and services from this local business.'}
                            </p>
                          </div>

                          {/* Admin Controls */}
                          {isAdmin && (
                            <div className="slide-admin-controls">
                              <button
                                className="slide-edit-btn"
                                onClick={() => startEdit(adv)}
                                title="Edit advertiser"
                              >
                                ✏️
                              </button>
                              <button
                                className="slide-delete-btn"
                                onClick={() => handleDeleteAdvertiser(adv._id || adv.id)}
                                title="Delete advertiser"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Carousel Indicators */}
                {displayData.length > 1 && (
                  <div className="carousel-indicators">
                    {displayData.map((_, index) => (
                      <button
                        key={index}
                        className={`indicator ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-advertisers">
                <h3>No Advertisers Yet</h3>
                <p>Be the first to advertise with us!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
