import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { API_ENDPOINTS } from './config';

export default function AdminAwards() {
  const { isAdmin, authenticatedFetch } = useAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', id: '', paid: false, price: 50 });
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch(API_ENDPOINTS.awards).then(r => r.json()).then(d => setCategories(d || []));
  }, []);

  const saveCategories = async (cats) => {
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.awards, { method: 'POST', body: JSON.stringify(cats) });
      if (res.ok) {
        setStatus('Saved');
        setCategories(cats);
      } else setStatus('Failed to save');
    } catch (err) { setStatus('Error saving'); }
  };

  const addCategory = () => {
    const id = form.id || `${form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const newCat = { id, title: form.title, description: form.description, paid: !!form.paid, price: form.price || 50, candidates: [] };
    const updated = [...categories, newCat];
    saveCategories(updated);
    setForm({ title: '', description: '', id: '', paid: false, price: 50 });
  };

  const addCandidate = async (catId, name) => {
    try {
      const res = await authenticatedFetch(`${API_ENDPOINTS.awards}/${catId}/candidates`, { method: 'POST', body: JSON.stringify({ id: `cand-${Date.now()}`, name, votes: 0 }) });
      if (res.ok) {
        const updated = await fetch(API_ENDPOINTS.awards).then(r => r.json());
        setCategories(updated);
      } else setStatus('Failed to add candidate');
    } catch (err) { setStatus('Error adding candidate'); }
  };

  if (!isAdmin) return <div className="page-center">You must be an admin to manage awards.</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin — Awards</h1>
      {status && <div className="status">{status}</div>}

      <div style={{ display: 'grid', gap: '1rem', maxWidth: 800 }}>
        <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 8 }}>
          <h3>Create Category</h3>
          <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <input placeholder="Short id (optional)" value={form.id} onChange={e => setForm({...form, id: e.target.value})} />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <label><input type="checkbox" checked={form.paid} onChange={e => setForm({...form, paid: e.target.checked})} /> Paid category</label>
          {form.paid && <input type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} />}
          <div style={{ marginTop: '0.5rem' }}>
            <button className="submit-btn" onClick={addCategory}>Add Category</button>
          </div>
        </div>

        <div>
          <h3>Existing Categories</h3>
          {categories.map(cat => (
            <div key={cat.id} style={{ border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: 8, marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{cat.title}</strong> {cat.paid && <span style={{ color: 'var(--accent-primary)' }}>(Paid)</span>} 
                  <div style={{ color: 'var(--text-secondary)' }}>{cat.description}</div>
                </div>
                <div>
                  <button onClick={() => { const name = window.prompt('Candidate name'); if (name) addCandidate(cat.id, name); }} className="submit-btn">Add Candidate</button>
                </div>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                {(cat.candidates || []).map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                    <div>{c.name}</div>
                    <div>{c.votes || 0}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
