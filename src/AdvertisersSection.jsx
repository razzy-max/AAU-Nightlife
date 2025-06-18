import React, { useEffect, useState } from 'react';
import './AdvertisersSection.css';

const API_URL = 'https://aau-nightlife-production.up.railway.app/api/advertisers';

const isAdmin = () => localStorage.getItem('aau_admin') === 'true';

export default function AdvertisersSection() {
  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', logo: '', link: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchAdvertisers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
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

  useEffect(() => {
    fetchAdvertisers();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'logo' && e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((f) => ({ ...f, logo: ev.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleAddAdvertiser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to add advertiser');
      setForm({ name: '', logo: '', link: '' });
      setShowForm(false);
      fetchAdvertisers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdvertiser = async (id) => {
    if (!window.confirm('Delete this advertiser?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete advertiser');
      fetchAdvertisers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="advertisers-section">
      <h2>Our Advertisers</h2>
      {isAdmin() && (
        <>
          <button
            onClick={() => setShowForm((f) => !f)}
            style={{ marginBottom: '1rem' }}
          >
            {showForm ? 'Hide Add Advertiser' : 'Add Advertiser'}
          </button>
          {showForm && (
            <form className="advertiser-add-form" onSubmit={handleAddAdvertiser}>
              <input
                type="text"
                name="name"
                placeholder="Advertiser Name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                type="url"
                name="link"
                placeholder="Advertiser Link"
                value={form.link}
                onChange={handleChange}
                required
              />
              <input
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleChange}
                required
              />
              {form.logo && (
                <img
                  src={form.logo}
                  alt="Preview"
                  className="advertiser-logo"
                  style={{ marginBottom: 8, maxHeight: 60 }}
                />
              )}
              <button type="submit" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Advertiser'}
              </button>
            </form>
          )}
        </>
      )}
      {loading ? (
        <div className="advertisers-loading">Loading...</div>
      ) : error ? (
        <div className="advertisers-error">{error}</div>
      ) : (
        <div className="advertisers-list">
          {advertisers.map((adv) => (
            <div className="advertiser-card" key={adv.id}>
              <a href={adv.link} target="_blank" rel="noopener noreferrer">
                <img src={adv.logo} alt={adv.name} className="advertiser-logo" />
                <div className="advertiser-name">{adv.name}</div>
              </a>
              {isAdmin() && (
                <button
                  className="advertiser-delete-btn"
                  onClick={() => handleDeleteAdvertiser(adv.id)}
                  title="Delete advertiser"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
