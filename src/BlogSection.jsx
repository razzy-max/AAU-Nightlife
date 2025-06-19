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
    const newPost = { ...form, id: Date.now(), excerpt, timestamp: Date.now() };
    await addPost(newPost);
    setForm({ title: '', image: '', content: '' });
    setShowForm(false);
  };

  // Always show the first blog post if none exist
  const defaultPost = {
    id: 1,
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
    title: 'Top 5 Nightlife Spots in Ekpoma',
    content: 'Full article content for Top 5 Nightlife Spots in Ekpoma. Discover the best places to unwind and have fun in Ekpoma. From clubs to lounges, here are our top picks for students. (Add more content as needed.)',
    excerpt: 'Discover the best places to unwind and have fun in Ekpoma. From clubs to lounges, here are our top picks for students.'
  };
  const blogPosts = posts.length === 0 ? [defaultPost] : posts;

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
        {blogPosts.map(post => (
          <div className="blog-card" key={post.id}>
            <img src={post.image} alt={post.title} className="blog-card-img" />
            <div className="blog-card-body">
              <h3 className="blog-card-title">{post.title}</h3>
              <p className="blog-card-excerpt">{post.excerpt || (post.content && post.content.slice(0, 90) + '...')}</p>
              <Link to={`/blog/${post.id}`} className="blog-card-btn">Read More</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
