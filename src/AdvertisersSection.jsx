import React, { useEffect, useState } from 'react';
import './AdvertisersSection.css';

const API_URL = 'https://aau-nightlife-production.up.railway.app/api/advertisers';

const isAdmin = () => localStorage.getItem('aau_admin') === 'true';

export default function AdvertisersSection() {
  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newAdvertiser, setNewAdvertiser] = useState({ name: '', logo: '', link: '' });
  const [submitting, setSubmitting] = useState(false);

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

  const handleInputChange = (e) => {
    setNewAdvertiser({ ...newAdvertiser, [e.target.name]: e.target.value });
  };

  const handleAddAdvertiser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdvertiser),
      });
      if (!res.ok) throw new Error('Failed to add advertiser');
      setNewAdvertiser({ name: '', logo: '', link: '' });
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
          <form className="advertiser-add-form" onSubmit={handleAddAdvertiser}>
            <input
              type="text"
              name="name"
              placeholder="Advertiser Name"
              value={newAdvertiser.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="url"
              name="logo"
              placeholder="Logo Image URL"
              value={newAdvertiser.logo}
              onChange={handleInputChange}
              required
            />
            <input
              type="url"
              name="link"
              placeholder="Advertiser Link"
              value={newAdvertiser.link}
              onChange={handleInputChange}
              required
            />
            <button type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Advertiser'}
            </button>
          </form>
          <button
            className="admin-logout-btn"
            onClick={() => {
              localStorage.removeItem('aau_admin');
              window.location.reload();
            }}
          >
            Logout Admin
          </button>
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
