import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import './BlogSection.css';
import { useBlog } from './BlogContext';
import { useAuth } from './AuthContext';

export default function BlogSection() {
  const blogContext = useBlog();
  console.log('BlogSection - full blog context:', blogContext);
  const { posts, addPost } = blogContext;
  console.log('BlogSection - addPost function:', addPost);
  console.log('BlogSection - addPost type:', typeof addPost);
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', image: '', content: '', video: '' });
  // Admin authentication now handled by AuthContext

  // Debug logging
  console.log('BlogSection component - isAdmin:', isAdmin, 'authLoading:', authLoading);

  const handleFormChange = e => {
    if ((e.target.name === 'image' || e.target.name === 'video') && e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = ev => {
        setForm(f => ({ ...f, [e.target.name]: ev.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handlePostSubmit = async e => {
    e.preventDefault();
    console.log('Submitting form with data:', form);
    console.log('addPost function available:', typeof addPost);

    const excerpt = form.content.slice(0, 90) + (form.content.length > 90 ? '...' : '');
    const newPost = { ...form, excerpt, timestamp: Date.now() };

    console.log('New post object:', newPost);

    if (!addPost) {
      console.error('addPost function is not available');
      alert('Error: Blog context not properly initialized. Please refresh the page.');
      return;
    }

    try {
      const created = await addPost(newPost); // get the backend response
      console.log('Post created successfully:', created);
      setForm({ title: '', image: '', content: '', video: '' });
      setShowForm(false);
      alert('Post created successfully!');
    } catch (error) {
      console.error('Failed to create post:', error);
      alert(`Failed to create post: ${error.message}`);
    }
  };

  // Sort posts by timestamp descending (newest first)
  const blogPosts = [...posts].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return (
    <section className="blog-section-modern">
      {/* Artistic Background Elements */}
      <div className="blog-background-art">
        <div className="blog-art-element element-1"></div>
        <div className="blog-art-element element-2"></div>
        <div className="blog-art-element element-3"></div>
        <div className="blog-art-element element-4"></div>
      </div>

      {/* Modern Header */}
      <div className="blog-header-modern">
        <div className="blog-header-content">
          <h2 className="blog-section-title-modern">
            <span className="blog-title-line-1">Latest from</span>
            <span className="blog-title-line-2">Our Blog</span>
          </h2>
          <p className="blog-section-subtitle">
            Discover insights, stories, and updates from the AAU community
          </p>
        </div>

        {/* Modern Admin Controls */}
        {isAdmin && (
          <div className="blog-admin-controls">
            <button
              onClick={() => setShowForm(f => !f)}
              className="blog-admin-btn"
            >
              <span className="blog-btn-icon">{showForm ? '✕' : '✍️'}</span>
              <span className="blog-btn-text">{showForm ? 'Cancel' : 'Create Post'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Modern Blog Form */}
      {showForm && (
        <div className="blog-form-container">
          <form className="blog-form-modern" onSubmit={handlePostSubmit}>
            <div className="blog-form-header">
              <h3 className="blog-form-title">Create New Blog Post</h3>
              <p className="blog-form-subtitle">Share your thoughts with the community</p>
            </div>

            <div className="blog-form-grid">
              <div className="blog-form-group">
                <label className="blog-form-label">Post Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                  className="blog-form-input"
                  placeholder="Enter an engaging title..."
                />
              </div>

              <div className="blog-form-group">
                <label className="blog-form-label">Featured Image</label>
                <div className="blog-file-input-wrapper">
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleFormChange}
                    required
                    className="blog-file-input"
                    id="blog-image"
                  />
                  <label htmlFor="blog-image" className="blog-file-label">
                    <span className="blog-file-icon">📸</span>
                    <span>Choose Image</span>
                  </label>
                  {form.image && (
                    <div className="file-preview">
                      <img src={form.image} alt="Preview" className="file-preview-image" />
                    </div>
                  )}
                </div>
              </div>

              <div className="blog-form-group">
                <label className="blog-form-label">Video (Optional)</label>
                <div className="blog-file-input-wrapper">
                  <input
                    type="file"
                    name="video"
                    accept="video/*"
                    onChange={handleFormChange}
                    className="blog-file-input"
                    id="blog-video"
                  />
                  <label htmlFor="blog-video" className="blog-file-label">
                    <span className="blog-file-icon">🎥</span>
                    <span>Choose Video</span>
                  </label>
                  {form.video && (
                    <div className="file-preview">
                      <video src={form.video} className="file-preview-video" controls />
                    </div>
                  )}
                </div>
              </div>

              <div className="blog-form-group blog-form-group-full">
                <label className="blog-form-label">Content</label>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleFormChange}
                  required
                  className="blog-form-textarea"
                  placeholder="Write your blog post content here..."
                  rows="8"
                ></textarea>
              </div>
            </div>

            <button type="submit" className="blog-form-submit">
              <span className="blog-submit-icon">✨</span>
              <span>Publish Post</span>
            </button>
          </form>
        </div>
      )}

      {/* Modern Blog Cards Grid */}
      <div className="blog-cards-modern">
        {blogPosts.length === 0 ? (
          <div className="blog-empty-state">
            <div className="empty-state-icon">📝</div>
            <h3 className="empty-state-title">No blog posts yet</h3>
            <p className="empty-state-text">Be the first to share your thoughts with the community!</p>
          </div>
        ) : (
          blogPosts.map((post, index) => (
            <div className={`blog-card-modern ${index === 0 ? 'featured' : ''}`} key={post._id || post.id}>
              <div className="blog-card-image-container">
                <img src={post.image} alt={post.title} className="blog-card-img-modern" />
                <div className="blog-card-overlay"></div>
                {index === 0 && <div className="featured-badge">Featured</div>}
              </div>

              <div className="blog-card-content">
                <h3 className="blog-card-title-modern">{post.title}</h3>
                <p className="blog-card-excerpt-modern">
                  {post.excerpt || (post.content && post.content.slice(0, 90) + '...')}
                </p>

                <div className="blog-card-footer">
                  <Link to={`/blog/${post._id || post.id}`} className="blog-card-btn-modern">
                    <span>Read More</span>
                    <svg className="blog-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </Link>

                  {post.timestamp && (
                    <div className="blog-card-date">
                      {new Date(post.timestamp).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
