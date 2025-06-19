import React, { useState } from 'react';
import './BlogSection.css';

export default function BlogSection() {
  // Blog posts state (empty initially)
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ title: '', content: '' });

  // Open add form
  const handleAdd = () => {
    setForm({ title: '', content: '' });
    setEditIndex(null);
    setShowForm(true);
  };

  // Open edit form
  const handleEdit = (idx) => {
    setForm(posts[idx]);
    setEditIndex(idx);
    setShowForm(true);
  };

  // Delete post
  const handleDelete = (idx) => {
    if (window.confirm('Delete this post?')) {
      setPosts(posts.filter((_, i) => i !== idx));
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    if (editIndex !== null) {
      // Edit
      setPosts(posts.map((p, i) => (i === editIndex ? form : p)));
    } else {
      // Add
      setPosts([{ ...form, date: new Date().toLocaleDateString() }, ...posts]);
    }
    setShowForm(false);
    setForm({ title: '', content: '' });
    setEditIndex(null);
  };

  return (
    <section className="blog-section">
      <div className="blog-header">
        <h2>AAU Nightlife Blog</h2>
        <button className="blog-add-btn" onClick={handleAdd}>Add Blog Post</button>
      </div>
      {showForm && (
        <form className="blog-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Content"
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            required
          />
          <div className="blog-form-actions">
            <button type="submit">{editIndex !== null ? 'Update' : 'Post'}</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
      <div className="blog-list">
        {posts.length === 0 ? (
          <p className="blog-empty">No blog posts yet.</p>
        ) : (
          posts.map((post, idx) => (
            <div className="blog-post" key={idx}>
              <h3>{post.title}</h3>
              <p className="blog-date">{post.date}</p>
              <p>{post.content}</p>
              <div className="blog-admin-actions">
                <button onClick={() => handleEdit(idx)}>Edit</button>
                <button onClick={() => handleDelete(idx)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
