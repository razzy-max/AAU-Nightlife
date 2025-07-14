import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { API_ENDPOINTS } from './config';
import './App.css';

export default function Hero() {
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ image: '' });
  const [pendingImages, setPendingImages] = useState([]);
  const { isAdmin, authenticatedFetch, isLoading: authLoading } = useAuth();

  useEffect(() => {
    fetch(API_ENDPOINTS.heroImages)
      .then(res => res.json())
      .then(data => {
        setHeroImages(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (heroImages.length === 0) return;
    const interval = setInterval(() => {
      setImgIdx(idx => (idx + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const handleChange = e => {
    if (e.target.name === 'image' && e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const readers = files.map(file => {
        return new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = ev => resolve(ev.target.result);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readers).then(imgs => setPendingImages(imgs));
    }
  };

  const handleSave = async e => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const newImages = [...heroImages, ...pendingImages];
      const res = await authenticatedFetch(API_ENDPOINTS.heroImages, {
        method: 'PUT',
        body: JSON.stringify(newImages)
      });
      if (res.ok) {
        setStatus('Images saved!');
        setPendingImages([]);
        setHeroImages(newImages);
      } else {
        setStatus('Failed to save images.');
      }
    } catch (error) {
      setStatus(error.message || 'Failed to save images.');
    }
  };

  const handleDelete = async idx => {
    if (!window.confirm('Delete this image?')) return;
    const updatedImages = heroImages.filter((_, i) => i !== idx);
    setHeroImages(updatedImages);
    try {
      await authenticatedFetch(API_ENDPOINTS.heroImages, {
        method: 'PUT',
        body: JSON.stringify(updatedImages)
      });
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
    if (imgIdx >= updatedImages.length) setImgIdx(0);
  };

  if (loading) return (
    <section className="hero-section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="hero-content" style={{ textAlign: 'center' }}>
        <div className="modern-spinner" style={{
          width: 60,
          height: 60,
          border: '3px solid rgba(255, 255, 255, 0.1)',
          borderTop: '3px solid var(--accent-tertiary)',
          borderRadius: '50%',
          animation: 'modernSpin 1s linear infinite',
          margin: '0 auto 1rem auto',
          boxShadow: '0 0 20px rgba(6, 255, 165, 0.3)'
        }} />
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.1rem',
          fontWeight: '500'
        }}>Loading amazing content...</p>
        <style>{`
          @keyframes modernSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </section>
  );

  // Debug logging
  console.log('Hero component - isAdmin:', isAdmin, 'authLoading:', authLoading);

  return (
    <section className="hero-section">
      {/* Modern overlay for better text contrast */}
      <div
        className="hero-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(10, 11, 20, 0.6)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Enhanced image container with modern effects */}
      {heroImages.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: 'var(--secondary-bg)',
          }}
        >
          <img
            src={heroImages[imgIdx]}
            alt="AAU Nightlife Hero"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
              pointerEvents: 'none',
              userSelect: 'none',
              transition: 'transform 0.5s ease, opacity 0.5s ease',
              transform: 'scale(1.05)',
              filter: 'brightness(0.8) contrast(1.1)',
            }}
          />
        </div>
      )}

      {/* Enhanced background animation */}
      <div className="hero-bg-anim" />
      <div className="hero-content">
        <h1 className="hero-title">
          Welcome to AAU Nightlife
        </h1>
        <p className="hero-subtitle">Where Every Night is an Experience!</p>

        {/* Modern call-to-action buttons */}
        <div className="hero-actions">
          
          <a href="/events" className="hero-btn secondary">
            View All Events
          </a>
        </div>
        {/* Modern Admin Panel */}
        {isAdmin && (
          <div className="admin-panel" style={{
            marginTop: 'var(--space-2xl)',
            padding: 'var(--space-lg)',
            background: 'rgba(22, 33, 62, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <button
              onClick={() => setShowForm(f => !f)}
              className="hero-btn secondary"
              style={{ marginBottom: 'var(--space-lg)', fontSize: '0.9rem', padding: 'var(--space-sm) var(--space-lg)' }}
            >
              {showForm ? 'Hide Image Form' : 'Add Hero Image'}
            </button>

            {showForm && (
              <form className="hero-form" onSubmit={handleSave} style={{
                marginBottom: 'var(--space-lg)',
                padding: 'var(--space-lg)',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)'
              }}>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--space-md)',
                  color: 'var(--text-primary)',
                  fontWeight: '500'
                }}>
                  Upload Images:
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    multiple
                    required
                    style={{
                      display: 'block',
                      marginTop: 'var(--space-sm)',
                      padding: 'var(--space-sm)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      width: '100%'
                    }}
                  />
                </label>

                {pendingImages.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-sm)',
                    margin: 'var(--space-md) 0',
                    flexWrap: 'wrap'
                  }}>
                    {pendingImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Preview"
                        style={{
                          width: 80,
                          height: 60,
                          objectFit: 'cover',
                          background: 'var(--card-bg)',
                          borderRadius: 'var(--radius-md)',
                          border: '2px solid var(--accent-primary)',
                          boxShadow: 'var(--shadow-md)'
                        }}
                      />
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  className="hero-btn primary"
                  style={{ fontSize: '0.9rem', padding: 'var(--space-sm) var(--space-lg)' }}
                >
                  Save Images
                </button>
              </form>
            )}

            {status && (
              <p style={{
                color: status.includes('saved') ? 'var(--accent-tertiary)' : 'var(--text-secondary)',
                fontWeight: '500',
                marginBottom: 'var(--space-md)'
              }}>
                {status}
              </p>
            )}

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-md)',
              justifyContent: 'center'
            }}>
              {heroImages.map((img, idx) => (
                <div key={idx} style={{
                  position: 'relative',
                  width: 100,
                  height: 75,
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: imgIdx === idx ? '3px solid var(--accent-primary)' : '2px solid var(--border-color)',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.3s ease'
                }}>
                  <img
                    src={img}
                    alt={`Hero ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <button
                    onClick={() => setImgIdx(idx)}
                    style={{
                      position: 'absolute',
                      left: 4,
                      bottom: 4,
                      fontSize: '0.7rem',
                      background: 'var(--accent-tertiary)',
                      color: 'var(--primary-bg)',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      padding: '2px 6px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Show
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    style={{
                      position: 'absolute',
                      right: 4,
                      top: 4,
                      fontSize: '0.7rem',
                      background: '#ff4d4f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      padding: '2px 6px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .hero-actions {
            flex-direction: column;
            align-items: center;
            gap: var(--space-md);
          }

          .hero-btn {
            width: 100%;
            max-width: 280px;
          }

          .admin-panel {
            margin-top: var(--space-xl) !important;
            padding: var(--space-md) !important;
          }

          .admin-panel .hero-form {
            padding: var(--space-md) !important;
          }
        }

        @media (max-width: 480px) {
          .hero-content {
            padding: var(--space-md) !important;
          }

          .admin-panel {
            margin-left: calc(-1 * var(--space-md));
            margin-right: calc(-1 * var(--space-md));
            border-radius: 0;
            border-left: none;
            border-right: none;
          }
        }
      `}</style>
    </section>
  );
}
