import React, { useEffect, useState } from 'react';
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
  const isAdmin = localStorage.getItem('aau_admin') === 'true';

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
      const res = await fetch(`${API_URL}/api/hero-images`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newImages)
      });
      if (res.ok) {
        setStatus('Images saved!');
        setPendingImages([]);
        setHeroImages(newImages);
      } else {
        setStatus('Failed to save images.');
      }
    } catch {
      setStatus('Failed to save images.');
    }
  };

  const handleDelete = async idx => {
    if (!window.confirm('Delete this image?')) return;
    const updatedImages = heroImages.filter((_, i) => i !== idx);
    setHeroImages(updatedImages);
    await fetch(`${API_URL}/api/hero-images`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedImages)
    });
    if (imgIdx >= updatedImages.length) setImgIdx(0);
  };

  if (loading) return <section className="hero-section"><div className="hero-content"><p>Loading hero images...</p></div></section>;

  return (
    <section
      className="hero-section"
      style={{
        backgroundImage: heroImages.length ? `url(${heroImages[imgIdx]})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.7s ease-in-out',
        position: 'relative',
      }}
    >
      <div className="hero-bg-anim" />
      <div className="hero-content">
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
          </>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, justifyContent: 'center' }}>
          {heroImages.map((img, idx) => (
            <div key={idx} style={{ position: 'relative', width: 80, height: 60 }}>
              <img src={img} alt={`Hero ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#222', borderRadius: 6, border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', display: 'block', margin: '0 auto', maxWidth: 80, maxHeight: 60 }} />
              <button onClick={() => setImgIdx(idx)} style={{ position: 'absolute', left: 4, bottom: 4, fontSize: 10, background: '#7bffb6', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}>Show</button>
              {isAdmin && (
                <button onClick={() => handleDelete(idx)} style={{ position: 'absolute', right: 4, top: 4, fontSize: 10, background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}>Delete</button>
              )}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 600px) {
          .hero-title {
            font-size: 2.2rem !important;
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }
          .hero-content {
            padding: 0.5rem;
          }
          .hero-section .hero-bg-anim {
            min-height: 180px;
          }
          .hero-section .admin-hero-thumbs {
            gap: 6px !important;
          }
          .hero-section .admin-hero-thumbs img {
            max-width: 48px !important;
            max-height: 36px !important;
          }
        }
      `}</style>
    </section>
  );
}
