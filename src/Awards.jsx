import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from './config';

export default function Awards() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch(API_ENDPOINTS.awards)
      .then(r => r.json())
      .then(d => { setCategories(d); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const handleVote = async (category, candidate) => {
    setStatus('Processing...');
    try {
      if (category.paid) {
        // Placeholder flow: open Paystack checkout, then submit vote with paymentRef
        // TODO: integrate Paystack SDK; here we simulate a payment flow
        const fakePaymentRef = `FAKE-${Date.now()}`;
        const res = await fetch(`${API_ENDPOINTS.awards}/${category.id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId: candidate.id, paymentRef: fakePaymentRef })
        });
        if (res.ok) {
          setStatus('Thank you! Your paid vote was recorded.');
        } else {
          const err = await res.json();
          setStatus(err.error || 'Payment or vote failed');
        }
      } else {
        const res = await fetch(`${API_ENDPOINTS.awards}/${category.id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId: candidate.id })
        });
        if (res.ok) setStatus('Vote recorded — thank you!');
        else {
          const err = await res.json();
          setStatus(err.error || 'Failed to record vote');
        }
      }
    } catch (err) {
      console.error(err);
      setStatus('An error occurred while voting.');
    }
    // Refresh categories
    fetch(API_ENDPOINTS.awards).then(r => r.json()).then(d => setCategories(d));
  };

  if (loading) return <div className="page-center">Loading awards...</div>;

  return (
    <div className="awards-page" style={{ padding: '2rem' }}>
      <h1>Awards & Voting</h1>
      {status && <div className="status">{status}</div>}
      <div className="awards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {categories.map(cat => (
          <div key={cat.id} className="award-card" style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <h3>{cat.title} {cat.paid ? `(Paid — ₦${cat.price || 50} per vote)` : '(Free)'}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{cat.description}</p>
            <div style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem' }}>
              {(cat.candidates || []).map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{c.name}</strong>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{c.info || ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>{c.votes || 0}</div>
                    <button onClick={() => handleVote(cat, c)} className="hero-btn secondary">Vote</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
