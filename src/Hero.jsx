import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import './App.css';

const API_URL = 'https://aau-nightlife-production.up.railway.app';

export default function Hero() {
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ image: '' });
  const [pendingImages, setPendingImages] = useState([]);
  const { isAdmin, authenticatedFetch } = useAuth();

  useEffect(() => {
    fetch(`${API_URL}/api/hero-images`)
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
      const res = await authenticatedFetch(`${API_URL}/api/hero-images`, {
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
      await authenticatedFetch(`${API_URL}/api/hero-images`, {
        method: 'PUT',
        body: JSON.stringify(updatedImages)
      });
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
    if (imgIdx >= updatedImages.length) setImgIdx(0);
  };

  if (loading) return (
    <section className="hero-section" style={{ minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="hero-content" style={{ textAlign: 'center' }}>
        <div className="spinner" style={{
          width: 48,
          height: 48,
          border: '5px solid #eee',
          borderTop: '5px solid #7bffb6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 12px auto'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </section>
  );

  return (
    <section
      className="hero-section"
      style={{
        background: '#23244a', // fallback background color
        position: 'relative',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 1rem 3rem 1rem',
        overflow: 'hidden',
      }}
    >
      {/* Overlay for better text contrast */}
      <div
        className="hero-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      {/* Image container for full image display */}
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
            background: '#23244a',
          }}
        >
          <img
            src={heroImages[imgIdx]}
            alt="Hero"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center',
              background: '#23244a',
              display: 'block',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
        </div>
      )}
      <div className="hero-bg-anim" style={{ position: 'relative', zIndex: 2 }} />
      <div className="hero-content" style={{ position: 'relative', zIndex: 3 }}>
        <h1
          className="hero-title"
          style={{
            color: 'white',
            fontSize: '5.5rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            padding: '0 1rem',
            width: '100%',
            boxSizing: 'border-box',
            textAlign: 'center',
          }}
        >
          Welcome to AAU Nightlife
        </h1>
        <p className="hero-subtitle"> Where Every Night is an Experience!</p>
        {isAdmin && (
          <>
            <button onClick={() => setShowForm(f => !f)} style={{marginBottom: '1rem'}}>
              {showForm ? 'Hide Image Form' : 'Add Hero Image'}
            </button>
            {showForm && (
              <form className="hero-form" onSubmit={handleSave} style={{marginBottom: '2rem'}}>
                <label>
                  Images:
                  <input type="file" name="image" accept="image/*" onChange={handleChange} multiple required />
                </label>
                {pendingImages.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
                    {pendingImages.map((img, idx) => (
                      <img key={idx} src={img} alt="Preview" style={{ width: 60, height: 45, objectFit: 'contain', background: '#222', borderRadius: 4, border: '1px solid #fff' }} />
                    ))}
                  </div>
                )}
                <button type="submit">Save</button>
              </form>
            )}
            {status && <p>{status}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, justifyContent: 'center' }}>
              {heroImages.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', width: 80, height: 60 }}>
                  <img src={img} alt={`Hero ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#222', borderRadius: 6, border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', display: 'block', margin: '0 auto', maxWidth: 80, maxHeight: 60 }} />
                  <button onClick={() => setImgIdx(idx)} style={{ position: 'absolute', left: 4, bottom: 4, fontSize: 10, background: '#7bffb6', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}>Show</button>
                  <button onClick={() => handleDelete(idx)} style={{ position: 'absolute', right: 4, top: 4, fontSize: 10, background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}>Delete</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <style>{`
        @media (max-width: 600px) {
          .hero-title {
            font-size: 2rem !important;
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
            line-height: 1.2;
            word-break: break-word;
          }
          .hero-content {
            padding: 0.5rem;
          }
          .hero-section .hero-bg-anim {
            min-height: 140px;
          }
        }
      `}</style>
    </section>
  );
}
