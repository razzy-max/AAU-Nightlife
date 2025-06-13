import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BlogSection.css';
import { useBlog } from './BlogContext';

export default function Blog() {
  const { id } = useParams();
  const { posts, setPosts, comments, setComments } = useBlog();
  const blog = posts.find(post => post.id === Number(id));
  const [input, setInput] = useState('');
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [form, setForm] = useState({ title: '', image: '', content: '' });
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('aau_admin') === 'true';
  const blogComments = comments[blog?.id] || [];

  if (!blog) return <div className="blog-detail-container">Blog post not found.</div>;

  const handleSubmit = e => {
    e.preventDefault();
    if (input.trim()) {
      const newComment = {
        name: anonymous ? 'Anonymous' : (name.trim() || 'Anonymous'),
        text: input.trim(),
      };
      setComments(prev => ({
        ...prev,
        [blog.id]: [...(prev[blog.id] || []), newComment],
      }));
      setInput('');
      setName('');
      setAnonymous(false);
    }
  };

  const handleDeleteComment = idx => {
    if (!window.confirm('Delete this comment?')) return;
    setComments(prev => ({
      ...prev,
      [blog.id]: prev[blog.id].filter((_, i) => i !== idx),
    }));
  };

  const handleFormChange = e => {
    if (e.target.name === 'image' && e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = ev => {
        setForm(f => ({ ...f, image: ev.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handlePostSubmit = e => {
    e.preventDefault();
    const excerpt = form.content.slice(0, 90) + (form.content.length > 90 ? '...' : '');
    setPosts([
      { ...form, id: Date.now(), excerpt, timestamp: Date.now() },
      ...posts,
    ]);
    setForm({ title: '', image: '', content: '' });
    setShowForm(false);
  };

  const handleDeletePost = () => {
    if (!window.confirm('Delete this blog post?')) return;
    setPosts(posts.filter(p => p.id !== blog.id));
    // Remove comments for this post too
    setComments(prev => {
      const copy = { ...prev };
      delete copy[blog.id];
      return copy;
    });
    navigate('/');
  };

  return (
    <section className="blog-detail-section hero-section">
      <div className="hero-bg-anim" />
      <div className="blog-detail-content">
        <button className="blog-back-btn" onClick={() => navigate('/')}>← Back to Home</button>
        {isAdmin && (
          <>
            <button onClick={() => setShowForm(f => !f)} style={{marginBottom: '1rem'}}>
              {showForm ? 'Hide Blog Form' : 'Add Blog Post'}
            </button>
            <button onClick={handleDeletePost} style={{marginLeft:8, marginBottom:'1rem', background:'#d9534f', color:'#fff', border:'none', borderRadius:6, padding:'6px 16px', cursor:'pointer'}}>
              Delete This Post
            </button>
            {showForm && (
              <form className="blog-form" onSubmit={handlePostSubmit} style={{marginBottom: '2rem'}}>
                <label>
                  Title:
                  <input type="text" name="title" value={form.title} onChange={handleFormChange} required />
                </label>
                <label>
                  Image:
                  <input type="file" name="image" accept="image/*" onChange={handleFormChange} required />
                </label>
                <label>
                  Content:
                  <textarea name="content" value={form.content} onChange={handleFormChange} required></textarea>
                </label>
                <button type="submit">Add Blog Post</button>
              </form>
            )}
          </>
        )}
        <img src={blog.image} alt={blog.title} className="blog-detail-img" />
        <h2 className="blog-detail-title">{blog.title}</h2>
        <div style={{color:'#aaa', fontSize:'0.98rem', marginBottom:'0.7rem'}}>
          {blog.timestamp ? new Date(blog.timestamp).toLocaleString() : 'No date'}
        </div>
        <div className="blog-detail-body">
          {blog.content.split(/\r?\n/).map((para, idx) =>
            para.trim() ? <p key={idx}>{para}</p> : <br key={idx} />
          )}
        </div>
        <div className="blog-comments">
          <h3>Comments</h3>
          <form onSubmit={handleSubmit} className="blog-comment-form">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="blog-comment-name"
              disabled={anonymous}
            />
            <label className="blog-anon-label">
              <input
                type="radio"
                checked={anonymous}
                onChange={() => setAnonymous(!anonymous)}
              />
              Comment as Anonymous
            </label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Share your thoughts..."
              className="blog-comment-input"
              rows={3}
              required
            />
            <button type="submit" className="blog-card-btn">Post Comment</button>
          </form>
          <ul className="blog-comment-list">
            {blogComments.map((c, i) => (
              <li key={i} className="blog-comment-item">
                <strong>{c.name}:</strong> {c.text}
                {isAdmin && (
                  <button style={{marginLeft:8, color:'#fff', background:'#d9534f', border:'none', borderRadius:6, padding:'2px 8px', cursor:'pointer'}} onClick={() => handleDeleteComment(i)} title="Delete comment">Delete</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
