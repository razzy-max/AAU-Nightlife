import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { API_ENDPOINTS } from './config';
import './Events.css';

export default function Awards() {
  const [categories, setCategories] = useState([]);
  // Track selected vote counts for paid categories by candidate key ("categoryId:candidateId")
  const [selectedCounts, setSelectedCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', id: '', paid: false, price: 50, candidates: [] });

  const { isAdmin, authenticatedFetch, isLoading: authLoading } = useAuth();

  useEffect(() => {
    fetch(API_ENDPOINTS.awards)
      .then(r => r.json())
      .then(d => { setCategories(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  // Admin: save full categories array
  const saveCategories = async (cats) => {
    setStatus('Saving...');
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.awards, { method: 'POST', body: JSON.stringify(cats) });
      if (res.ok) {
        setStatus('Saved');
        setCategories(cats);
      } else {
        const err = await res.json().catch(() => ({}));
        setStatus(err.error || 'Failed to save');
      }
    } catch (err) {
      console.error(err);
      setStatus('Error saving');
    }
    setTimeout(() => setStatus(''), 2000);
  };

  const startAdd = () => {
    setForm({ title: '', description: '', id: '', paid: false, price: 50, candidates: [] });
    setEditingIndex(null);
    setShowForm(true);
  };

  const startEdit = (idx) => {
    const cat = categories[idx];
    setForm({ title: cat.title || '', description: cat.description || '', id: cat.id || '', paid: !!cat.paid, price: cat.price || 50, candidates: cat.candidates || [] });
    setEditingIndex(idx);
    setShowForm(true);
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    const id = form.id || `${form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const newCat = { id, title: form.title, description: form.description, paid: !!form.paid, price: form.price || 50, candidates: form.candidates || [] };
    let updated;
    if (editingIndex !== null) {
      updated = categories.map((c, i) => i === editingIndex ? newCat : c);
    } else {
      updated = [...categories, newCat];
    }
    setCategories(updated);
    saveCategories(updated);
    setShowForm(false);
    setEditingIndex(null);
  };

  const deleteCategory = (idx) => {
    if (!window.confirm('Delete this category?')) return;
    const updated = categories.filter((_, i) => i !== idx);
    setCategories(updated);
    saveCategories(updated);
  };

  const addCandidateInline = (idx) => {
    const name = window.prompt('Candidate name');
    if (!name) return;
    const updated = [...categories];
    const cat = { ...updated[idx] };
    cat.candidates = [...(cat.candidates || []), { id: `cand-${Date.now()}`, name, votes: 0 }];
    updated[idx] = cat;
    setCategories(updated);
    saveCategories(updated);
  };

  const deleteCandidateInline = (catIdx, candIdx) => {
    if (!window.confirm('Delete this candidate?')) return;
    const updated = [...categories];
    const cat = { ...updated[catIdx] };
    cat.candidates = (cat.candidates || []).filter((_, i) => i !== candIdx);
    updated[catIdx] = cat;
    setCategories(updated);
    saveCategories(updated);
  };

  const togglePaid = (idx) => {
    const updated = [...categories];
    updated[idx] = { ...updated[idx], paid: !updated[idx].paid };
    setCategories(updated);
    saveCategories(updated);
  };

  const handleVote = async (category, candidate) => {
    setStatus('Processing...');
    try {
      if (category.paid) {
        const key = `${category.id}:${candidate.id}`;
        const count = selectedCounts[key] && selectedCounts[key] > 0 ? selectedCounts[key] : 1;
        // Here you'd normally redirect to payment gateway with the amount and count.
        // For now, create a fake paymentRef and send votesCount to the backend.
        const fakePaymentRef = `FAKE-${Date.now()}`;
        const res = await fetch(`${API_ENDPOINTS.awards}/${category.id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId: candidate.id, paymentRef: fakePaymentRef, votesCount: count })
        });
        if (res.ok) setStatus(`Thank you! Your ${count} paid vote${count > 1 ? 's' : ''} were recorded.`);
        else {
          const err = await res.json().catch(() => ({}));
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
          const err = await res.json().catch(() => ({}));
          setStatus(err.error || 'Failed to record vote');
        }
      }
    } catch (err) {
      console.error(err);
      setStatus('An error occurred while voting.');
    }
    // Refresh categories
    fetch(API_ENDPOINTS.awards).then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : []));
  };

  const changeCount = (categoryId, candidateId, delta) => {
    const key = `${categoryId}:${candidateId}`;
    setSelectedCounts(prev => {
      const current = prev[key] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [key]: next };
    });
  };

  if (loading) return <div className="page-center">Loading awards...</div>;

  return (
    <div className="modern-events-page awards-page" style={{ paddingBottom: '4rem' }}>
      <section className="events-hero-modern">
        <div className="floating-trophy trophy-1"></div>
        <div className="floating-trophy trophy-2"></div>
        <div className="floating-trophy trophy-3"></div>
        <div className="events-hero-content">
          <div className="hero-text-container">
            <h1 className="events-title-modern">Awards & Voting</h1>
          </div>
        </div>
      </section>

      <main className="events-main-modern">+






        
        <div className="events-container-modern">
          {/* Admin controls like Events page */}
          {isAdmin && (
            <div className="admin-controls-modern">
              <div className="admin-header">
                <h2 className="admin-title-modern">Awards Management</h2>
                <div className="admin-badge">Admin Panel</div>
              </div>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (showForm) {
                    setEditingIndex(null);
                    setForm({ title: '', description: '', id: '', paid: false, price: 50, candidates: [] });
                  }
                }}
                className="add-event-btn-modern"
              >
                <span className="btn-icon">{showForm ? '✕' : '+'}</span>
                <span className="btn-text">{showForm ? 'Cancel' : 'Add Category'}</span>
              </button>
            </div>
          )}

          {/* Admin form for categories */}
          {showForm && isAdmin && (
            <form onSubmit={handleCategorySubmit} className="event-form-modern">
              <div className="form-header-modern">
                <h3 className="form-title-modern">{editingIndex !== null ? 'Edit Category' : 'Create Category'}</h3>
                <p className="form-subtitle-modern">Fill in the details below to {editingIndex !== null ? 'update' : 'create'} a category</p>
              </div>

              <div className="form-grid-modern">
                <div className="form-group-modern">
                  <label className="form-label-modern">Category Title</label>
                  <input type="text" required className="form-input-modern" placeholder="Category title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>

                <div className="form-group-modern">
                  <label className="form-label-modern">Paid?</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={form.paid} onChange={e => setForm({...form, paid: e.target.checked})} />
                    <span>Paid category (require payment per vote)</span>
                  </label>
                  {form.paid && <input type="number" className="form-input-modern" min={0} value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} />}
                </div>

                <div className="form-group-modern" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label-modern">Description</label>
                  <textarea className="form-input-modern" placeholder="Short description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ minHeight: 120 }} />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="submit-btn">{editingIndex !== null ? 'Update Category' : 'Create Category'}</button>
              </div>
            </form>
          )}

          {status && <div className={`status-message ${status.toLowerCase().includes('error') ? 'error' : 'success'}`}>{status}</div>}

          {/* Public categories and voting grid */}
          <div className="awards-categories-grid" style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {loading && <div className="page-center">Loading categories...</div>}
            {!loading && categories.length === 0 && <div>No categories yet.</div>}

            {categories.map((cat, idx) => (
              <div key={cat.id} style={{ border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: 8, background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '1.1rem' }}>{cat.title}</strong>
                    <div style={{ color: 'var(--text-secondary)' }}>{cat.description}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{cat.paid ? `Paid — ₦${cat.price || 50}` : 'Free voting'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isAdmin && (
                      <>
                        <button className="submit-btn" onClick={() => startEdit(idx)}>Edit</button>
                        <button className="submit-btn" onClick={() => addCandidateInline(idx)}>+ Candidate</button>
                        <button className="submit-btn" onClick={() => togglePaid(idx)}>{cat.paid ? 'Set Free' : 'Set Paid'}</button>
                        <button className="submit-btn danger" onClick={() => deleteCategory(idx)}>Delete</button>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  {(cat.candidates || []).length === 0 && <div style={{ color: 'var(--text-secondary)' }}>No candidates</div>}
                  {(cat.candidates || []).map((c, ci) => (
                    <div key={c.id} className="candidate-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.info || ''}</div>
                      </div>
                      <div className="candidate-controls" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <div style={{ fontWeight: 700 }}>{c.votes || 0}</div>
                            {cat.paid ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div className="candidate-counter" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <button className="hero-btn" onClick={() => changeCount(cat.id, c.id, -1)}>-</button>
                                    <div className="counter-value" style={{ minWidth: 28, textAlign: 'center' }}>{selectedCounts[`${cat.id}:${c.id}`] || 1}</div>
                                    <button className="hero-btn" onClick={() => changeCount(cat.id, c.id, 1)}>+</button>
                                  </div>
                                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total: ₦{(cat.price || 50) * (selectedCounts[`${cat.id}:${c.id}`] || 1)}</div>
                                  <button className="hero-btn secondary" onClick={() => handleVote(cat, c)}>Pay & Vote</button>
                              </div>
                            ) : (
                              <>
                                <button className="hero-btn secondary" onClick={() => handleVote(cat, c)}>Vote</button>
                              </>
                            )}
                            {isAdmin && <button className="submit-btn" onClick={() => deleteCandidateInline(idx, ci)}>Delete</button>}
                          </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
