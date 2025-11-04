import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { API_ENDPOINTS, PAYSTACK_CONFIG } from './config';
import './Events.css';

// Simple CAPTCHA component
const SimpleCaptcha = ({ onVerify, onReset }) => {
  const [num1, setNum1] = useState(Math.floor(Math.random() * 10) + 1);
  const [num2, setNum2] = useState(Math.floor(Math.random() * 10) + 1);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const generateNew = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setUserAnswer('');
    setIsVerified(false);
    onReset && onReset();
  };

  const checkAnswer = () => {
    if (parseInt(userAnswer) === num1 + num2) {
      setIsVerified(true);
      onVerify && onVerify();
    } else {
      generateNew();
    }
  };

  useEffect(() => {
    generateNew();
  }, []);

  return (
    <div style={{ margin: '0.5rem 0', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 4, background: 'var(--card-bg)' }}>
      <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Solve: {num1} + {num2} = ?</div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Answer"
          style={{ width: 60, padding: '0.25rem' }}
          disabled={isVerified}
        />
        {!isVerified ? (
          <button onClick={checkAnswer} className="hero-btn" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>Verify</button>
        ) : (
          <span style={{ color: 'green', fontSize: '0.8rem' }}>✓ Verified</span>
        )}
        <button onClick={generateNew} className="hero-btn secondary" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>New</button>
      </div>
    </div>
  );
};

export default function Awards() {
  const [categories, setCategories] = useState([]);
  // Track selected vote counts for paid categories by candidate key ("categoryId:candidateId")
  const [selectedCounts, setSelectedCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', id: '', paid: false, price: 50, candidates: [] });
  const [votedCategories, setVotedCategories] = useState(new Set()); // Track voted free categories in this session
  const [votingInProgress, setVotingInProgress] = useState(new Set()); // Track ongoing votes to prevent rapid clicks
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`); // Unique session ID
  const [showCaptcha, setShowCaptcha] = useState(false); // Show CAPTCHA for free voting
  const [captchaVerified, setCaptchaVerified] = useState(false); // Track CAPTCHA verification
  const [pendingVote, setPendingVote] = useState(null); // Store pending vote data
  const [paymentInProgress, setPaymentInProgress] = useState(false); // Track payment processing
  const [paymentData, setPaymentData] = useState(null); // Store payment initialization data

  const { isAdmin, authenticatedFetch, isLoading: authLoading } = useAuth();

  useEffect(() => {
    fetch(API_ENDPOINTS.awards)
      .then(r => r.json())
      .then(d => { setCategories(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });

    // Load voted categories from localStorage to persist across page reloads
    const voted = localStorage.getItem('votedCategories');
    if (voted) {
      setVotedCategories(new Set(JSON.parse(voted)));
    }

    // Check for payment success callback
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const reference = urlParams.get('reference');

    if (paymentSuccess === 'true' && reference) {
      // Extract payment details from reference
      const parts = reference.split('-');
      if (parts.length >= 4 && parts[0] === 'VOTE') {
        const categoryId = parts[1];
        const candidateId = parts[2];
        const votesCount = parseInt(parts[3]) || 1;

        // Verify payment and record vote
        verifyPaymentAndVote(reference, categoryId, candidateId, votesCount);

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
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
    // Prevent rapid clicks
    if (votingInProgress.has(category.id)) {
      return;
    }

    // For free categories, check if already voted in this session
    if (!category.paid && votedCategories.has(category.id)) {
      setStatus('You have already voted in this free category.');
      return;
    }

    // For free categories, show confirmation dialog and CAPTCHA
    if (!category.paid) {
      const confirmed = window.confirm(`Are you sure you want to vote for "${candidate.name}" in "${category.title}"? You can only vote once in free categories.`);
      if (!confirmed) return;

      // Show CAPTCHA
      setPendingVote({ category, candidate });
      setShowCaptcha(true);
      setCaptchaVerified(false);
      return;
    }

    await processVote(category, candidate);
  };

  // Initialize Paystack payment
  const initializePayment = async (category, candidate) => {
    const key = `${category.id}:${candidate.id}`;
    const count = selectedCounts[key] && selectedCounts[key] > 0 ? selectedCounts[key] : 1;

    setPaymentInProgress(true);
    setStatus('Initializing payment...');

    try {
      const response = await fetch(API_ENDPOINTS.paystackInitialize, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: category.id,
          candidateId: candidate.id,
          votesCount: count,
          email: 'user@example.com' // In production, get from user input
        })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        setStatus(data.error || 'Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      setStatus('Payment initialization failed. Please try again.');
    } finally {
      setPaymentInProgress(false);
    }
  };

  // Verify payment and record vote
  const verifyPaymentAndVote = async (reference, categoryId, candidateId, votesCount) => {
    try {
      setStatus('Verifying payment...');

      const response = await fetch(API_ENDPOINTS.verifyPayment, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference })
      });

      const data = await response.json();

      if (data.success) {
        // Use the actual votesCount from the server response instead of the URL parameter
        const actualVotesCount = data.votesCount || votesCount;
        setStatus(`Thank you! Your ${actualVotesCount} paid vote${actualVotesCount > 1 ? 's' : ''} ${actualVotesCount === 1 ? 'was' : 'were'} recorded.`);
        // Refresh categories to show updated vote counts
        fetch(API_ENDPOINTS.awards).then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : []));
      } else {
        setStatus(data.error || 'Payment verification failed. Please contact support if you were charged.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('Payment verification failed. Please try again.');
    }
  };

  const processVote = async (category, candidate) => {
    setVotingInProgress(prev => new Set(prev).add(category.id));
    setStatus('Processing...');

    try {
      if (category.paid) {
        // Initialize Paystack payment instead of fake payment
        await initializePayment(category, candidate);
        return; // Payment flow will continue after redirect
      } else {
        const res = await fetch(`${API_ENDPOINTS.awards}/${category.id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId: candidate.id, sessionId })
        });
        if (res.ok) {
          setStatus('Vote recorded — thank you!');
          // Mark as voted in this session and persist to localStorage
          const newVoted = new Set(votedCategories).add(category.id);
          setVotedCategories(newVoted);
          localStorage.setItem('votedCategories', JSON.stringify([...newVoted]));
          // Reset CAPTCHA state
          setShowCaptcha(false);
          setCaptchaVerified(false);
          setPendingVote(null);
        } else {
          const err = await res.json().catch(() => ({}));
          setStatus(err.error || 'Failed to record vote');
        }
      }
    } catch (err) {
      console.error(err);
      setStatus('An error occurred while voting.');
    } finally {
      setVotingInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(category.id);
        return newSet;
      });
    }
    // Refresh categories
    fetch(API_ENDPOINTS.awards).then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : []));
  };

  const handleCaptchaVerify = () => {
    setCaptchaVerified(true);
  };

  const handleCaptchaReset = () => {
    setCaptchaVerified(false);
  };

  const submitVoteWithCaptcha = () => {
    if (captchaVerified && pendingVote) {
      processVote(pendingVote.category, pendingVote.candidate);
    }
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

          {/* CAPTCHA Modal for free voting */}
          {showCaptcha && pendingVote && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'var(--card-bg)',
                padding: '1rem',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                maxWidth: 400,
                width: '90%'
              }}>
                <h3 style={{ marginBottom: '1rem' }}>Verify You're Human</h3>
                <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Before voting for "{pendingVote.candidate.name}" in "{pendingVote.category.title}", please solve this simple math problem:
                </p>
                <SimpleCaptcha onVerify={handleCaptchaVerify} onReset={handleCaptchaReset} />
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button
                    onClick={() => { setShowCaptcha(false); setPendingVote(null); }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitVoteWithCaptcha}
                    disabled={!captchaVerified}
                    className="submit-btn"
                  >
                    Submit Vote
                  </button>
                </div>
              </div>
            </div>
          )}

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
                                  <button
                                    className="hero-btn secondary"
                                    onClick={() => handleVote(cat, c)}
                                    disabled={paymentInProgress}
                                  >
                                    {paymentInProgress ? 'Processing...' : 'Pay & Vote'}
                                  </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  className="hero-btn secondary"
                                  onClick={() => handleVote(cat, c)}
                                  disabled={votedCategories.has(cat.id) || votingInProgress.has(cat.id)}
                                >
                                  {votedCategories.has(cat.id) ? 'Already Voted' : votingInProgress.has(cat.id) ? 'Voting...' : 'Vote'}
                                </button>
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
