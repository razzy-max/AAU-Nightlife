import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { API_ENDPOINTS } from './config';

export default function AdminAwards() {
  const { isAdmin, authenticatedFetch, isLoading: authLoading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', id: '', paid: false, price: 50 });
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch(API_ENDPOINTS.awards)
      .then(r => r.json())
      .then(d => { setCategories(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setCategories([]); setLoading(false); });
  }, []);

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
    setTimeout(() => setStatus(''), 2500);
  };

  const startAdd = () => {
    setForm({ title: '', description: '', id: '', paid: false, price: 50 });
    setEditingIndex(null);
    setShowForm(true);
  };

  const startEdit = (idx) => {
    const cat = categories[idx];
    setForm({ title: cat.title || '', description: cat.description || '', id: cat.id || '', paid: !!cat.paid, price: cat.price || 50 });
    setEditingIndex(idx);
    setShowForm(true);
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    const id = form.id || `${form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const newCat = { id, title: form.title, description: form.description, paid: !!form.paid, price: form.price || 50, candidates: categories[editingIndex]?.candidates || [] };

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

  if (authLoading) return <div className="page-center">Checking admin...</div>;
  if (!isAdmin) return <div className="page-center">You must be an admin to manage awards.</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin — Awards</h1>
      {status && <div className="status">{status}</div>}

      <div style={{ marginBottom: '1rem' }}>
        <button className="submit-btn" onClick={() => { showForm ? setShowForm(false) : startAdd(); }}>{showForm ? 'Cancel' : 'Add Category'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleCategorySubmit} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 8, maxWidth: 800 }}>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <input placeholder="Category title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <input placeholder="Short id (optional)" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="checkbox" checked={form.paid} onChange={e => setForm({ ...form, paid: e.target.checked })} /> Paid category
            </label>
            {form.paid && <input type="number" min={0} value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />}
            <div>
              <button className="submit-btn" type="submit">{editingIndex !== null ? 'Update Category' : 'Create Category'}</button>
            </div>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem', maxWidth: 900 }}>
        {loading && <div className="page-center">Loading categories...</div>}
        {!loading && categories.length === 0 && <div>No categories yet.</div>}

        {categories.map((cat, idx) => (
          <div key={cat.id} style={{ border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: 8, background: 'var(--card-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{cat.title}</strong>
                <div style={{ color: 'var(--text-secondary)' }}>{cat.description}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{cat.paid ? `Paid — ₦${cat.price || 50}` : 'Free voting'}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="submit-btn" onClick={() => startEdit(idx)}>Edit</button>
                <button className="submit-btn" onClick={() => addCandidateInline(idx)}>+ Candidate</button>
                <button className="submit-btn" onClick={() => togglePaid(idx)}>{cat.paid ? 'Set Free' : 'Set Paid'}</button>
                <button className="submit-btn danger" onClick={() => deleteCategory(idx)}>Delete</button>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              {(cat.candidates || []).length === 0 && <div style={{ color: 'var(--text-secondary)' }}>No candidates</div>}
              {(cat.candidates || []).map((c, ci) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', alignItems: 'center' }}>
                  <div>
                    <div>{c.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.info || ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>{c.votes || 0}</div>
                    <button className="submit-btn" onClick={() => deleteCandidateInline(idx, ci)}>Delete</button>
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
