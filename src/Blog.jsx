import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BlogSection.css';
import { useBlog } from './BlogContext';

// Helper to convert [text](url) to clickable links
function renderContentWithLinks(content) {
  // Convert markdown-style [text](url) to anchor tags
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push(
      <a href={match[2]} target="_blank" rel="noopener noreferrer" key={key++} style={{ color: '#0074D9', textDecoration: 'underline' }}>
        {match[1]}
      </a>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }
  return parts;
}

export default function Blog() {
  const { id } = useParams();
  const { posts, editPost, removePost, comments, addComment, removeComment } = useBlog();
  // Find by _id for MongoDB
  const blog = posts.find(post => String(post._id) === String(id));
  const [input, setInput] = useState('');
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [form, setForm] = useState({ title: '', image: '', content: '' });
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', image: '', content: '' });
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('aau_admin') === 'true';
  // Use _id for comments and update removeComment to use commentId
  const blogComments = comments[blog?._id] || [];

  if (!blog) return <div className="blog-detail-container">Blog post not found.</div>;

  const handleSubmit = async e => {
    e.preventDefault();
    if (input.trim()) {
      const newComment = {
        name: anonymous ? 'Anonymous' : (name.trim() || 'Anonymous'),
        text: input.trim(),
      };
      await addComment(blog.id, newComment);
      setInput('');
      setName('');
      setAnonymous(false);
    }
  };

  const handleDeleteComment = async commentId => {
    if (!window.confirm('Delete this comment?')) return;
    await fetch(`https://aau-nightlife-production.up.railway.app/api/blog-comments/${commentId}`, {
      method: 'DELETE'
    });
    removeComment(blog._id, commentId);
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

  const handleEditFormChange = e => {
    if (e.target.name === 'image' && e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = ev => {
        setEditForm(f => ({ ...f, image: ev.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    } else {
      setEditForm({ ...editForm, [e.target.name]: e.target.value });
    }
  };

  const handlePostSubmit = async e => {
    e.preventDefault();
    const excerpt = form.content.slice(0, 90) + (form.content.length > 90 ? '...' : '');
    const newPost = { ...form, id: Date.now(), excerpt, timestamp: Date.now() };
    await addPost(newPost);
    setForm({ title: '', image: '', content: '' });
    setShowForm(false);
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this blog post?')) return;
    await removePost(blog._id);
    navigate('/');
  };

  const startEdit = () => {
    setEditForm({ title: blog.title, image: blog.image, content: blog.content });
    setEditMode(true);
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    const excerpt = editForm.content.slice(0, 90) + (editForm.content.length > 90 ? '...' : '');
    const updated = { ...blog, ...editForm, excerpt };
    await editPost(blog._id, updated);
    setEditMode(false);
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
            <button onClick={startEdit} style={{marginLeft:8, marginBottom:'1rem', background:'#0074D9', color:'#fff', border:'none', borderRadius:6, padding:'6px 16px', cursor:'pointer'}}>
              Edit This Post
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
            {editMode && (
              <form className="blog-form" onSubmit={handleEditSubmit} style={{marginBottom: '2rem'}}>
                <label>
                  Title:
                  <input type="text" name="title" value={editForm.title} onChange={handleEditFormChange} required />
                </label>
                <label>
                  Image:
                  <input type="file" name="image" accept="image/*" onChange={handleEditFormChange} />
                </label>
                <label>
                  Content:
                  <textarea name="content" value={editForm.content} onChange={handleEditFormChange} required></textarea>
                </label>
                <button type="submit">Save Changes</button>
                <button type="button" onClick={() => setEditMode(false)} style={{marginLeft:8}}>Cancel</button>
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
            para.trim() ? <p key={idx}>{renderContentWithLinks(para)}</p> : <br key={idx} />
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
              <li key={c._id || i} className="blog-comment-item">
                <strong>{c.name}:</strong> {c.text}
                {isAdmin && (
                  <button style={{marginLeft:8, color:'#fff', background:'#d9534f', border:'none', borderRadius:6, padding:'2px 8px', cursor:'pointer'}} onClick={() => handleDeleteComment(c._id)} title="Delete comment">Delete</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// All API calls updated to use https://aau-nightlife-production.up.railway.app/api/... instead of localhost:5000
