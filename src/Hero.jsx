import React, { useState, useEffect } from 'react';
import './App.css';

const defaultHeroImages = [
  'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1515168833906-d2a3b82b3029?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1468071174046-657d9d351a40?auto=format&fit=crop&w=800&q=80',
];

export default function Hero() {
  const [heroImages, setHeroImages] = useState([]);
  const [imgIdx, setImgIdx] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const isAdmin = localStorage.getItem('aau_admin') === 'true';

  // Fetch hero images from backend
  useEffect(() => {
    fetch('/api/hero-images')
      .then(res => res.json())
      .then(data => {
        setHeroImages(Array.isArray(data) && data.length ? data : defaultHeroImages);
        setLoading(false);
      })
      .catch(() => {
        setHeroImages(defaultHeroImages);
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

  // Update backend when admin changes images
  const updateBackend = imgs => {
    fetch('/api/hero-images', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(imgs)
    }).then(() => setHeroImages(imgs));
  };

  const handleUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = ev => {
      const newImgs = [...heroImages, ev.target.result];
      updateBackend(newImgs);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = idx => {
    const newImgs = heroImages.filter((_, i) => i !== idx);
    updateBackend(newImgs);
    if (imgIdx >= newImgs.length) setImgIdx(0);
  };

  if (loading) return <section className="hero-section"><div className="hero-content"><p>Loading hero images...</p></div></section>;

  return (
    <section
      className="hero-section"
      style={{
        backgroundImage: `url(${heroImages[imgIdx]})`,
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
            color: '#2d2d6e',
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
          <div style={{ marginTop: 24, background: 'rgba(0,0,0,0.5)', padding: 16, borderRadius: 12 }}>
            <label style={{ color: '#fff', fontWeight: 500 }}>
              Add Hero Image:
              <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: 'block', margin: '8px 0' }} />
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, justifyContent: 'center' }}>
              {heroImages.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', width: 80, height: 60 }}>
                  <img src={img} alt={`Hero ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#222', borderRadius: 6, border: imgIdx === idx ? '2px solid #7bffb6' : '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', display: 'block', margin: '0 auto', maxWidth: 80, maxHeight: 60 }} />
                  <button onClick={() => setImgIdx(idx)} style={{ position: 'absolute', left: 4, bottom: 4, fontSize: 10, background: '#7bffb6', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}>Show</button>
                  <button onClick={() => handleDelete(idx)} style={{ position: 'absolute', right: 4, top: 4, fontSize: 10, background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}
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
