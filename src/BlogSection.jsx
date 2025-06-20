import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import './BlogSection.css';
import { useBlog } from './BlogContext';

export default function BlogSection() {
  const { posts, addPost } = useBlog();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', image: '', content: '' });
  const isAdmin = localStorage.getItem('aau_admin') === 'true';

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

  const handlePostSubmit = async e => {
    e.preventDefault();
    const excerpt = form.content.slice(0, 90) + (form.content.length > 90 ? '...' : '');
    const newPost = { ...form, excerpt, timestamp: Date.now() };
    const created = await addPost(newPost); // get the backend response
    setForm({ title: '', image: '', content: '' });
    setShowForm(false);
  };

  // Sort posts by timestamp descending (newest first)
  const blogPosts = [...posts].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return (
    <section className="blog-section">
      <h2 className="blog-section-title">Latest from Our Blog</h2>
      {isAdmin && (
        <button onClick={() => setShowForm(f => !f)} style={{marginBottom: '1rem'}}>
          {showForm ? 'Hide Blog Form' : 'Add Blog Post'}
        </button>
      )}
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
      <div className="blog-cards">
        {blogPosts.length === 0 ? (
          <div style={{color:'#aaa', textAlign:'center', marginTop:'2rem'}}>No blog posts yet.</div>
        ) : (
          blogPosts.map(post => (
            <div className="blog-card" key={post._id || post.id}>
              <img src={post.image} alt={post.title} className="blog-card-img" />
              <div className="blog-card-body">
                <h3 className="blog-card-title">{post.title}</h3>
                <p className="blog-card-excerpt">{post.excerpt || (post.content && post.content.slice(0, 90) + '...')}</p>
                <Link to={`/blog/${post._id || post.id}`} className="blog-card-btn">Read More</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
