import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BlogSection.css';
import { useBlog } from './BlogContext';
import { useAuth } from './AuthContext';

// Format timestamp to show relative time or full date/time
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // difference in seconds

  if (diff < 60) {
    return 'Just now';
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

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
  const { posts, editPost, removePost, comments, addComment, removeComment, fetchCommentsForBlog } = useBlog();
  const { isAdmin } = useAuth();
  // Find by _id for MongoDB
  const blog = posts.find(post => String(post._id) === String(id));
  const [input, setInput] = useState('');
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [form, setForm] = useState({ title: '', image: '', content: '', video: '' });
  const [showForm, setShowForm] = useState(false);
  // Edit post (like events: show inline form, update state, then backend, then refresh)
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', image: '', content: '', video: '' });
  const navigate = useNavigate();
  // Use _id for comments and update removeComment to use commentId
  const blogComments = comments[blog?._id] || [];

  // Scroll to top only when the component first mounts or when the blog ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]); // Only depend on the blog ID from URL params

  // Load comments for this specific blog post
  useEffect(() => {
    if (blog?._id) {
      fetchCommentsForBlog(blog._id);
    }
  }, [blog?._id]); // Remove fetchCommentsForBlog from dependencies to prevent constant re-runs

  if (!blog) return <div className="blog-detail-container">Loading blog post...</div>;

  const handleSubmit = async e => {
    e.preventDefault();
    if (input.trim()) {
      const newComment = {
        name: anonymous ? 'Anonymous' : (name.trim() || 'Anonymous'),
        text: input.trim(),
      };
      try {
        await addComment(blog._id, newComment);
        // Only clear the form if the comment was successfully added
        setInput('');
        setName('');
        setAnonymous(false);
      } catch (error) {
        console.error('Failed to add comment:', error);
        // You could add user-facing error handling here, like showing an error message
        alert('Failed to post comment. Please try again.');
      }
    }
  };

  const handleDeleteComment = async commentId => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await removeComment(blog._id, commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

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
    const excerpt = form.content.slice(0, 90) + (form.content.length > 90 ? '...' : '');
    const newPost = { ...form, id: Date.now(), excerpt, timestamp: Date.now() };
    await addPost(newPost);
    setForm({ title: '', image: '', content: '', video: '' });
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

  const handleEditFormChange = e => {
    if ((e.target.name === 'image' || e.target.name === 'video') && e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = ev => {
        setEditForm(f => ({ ...f, [e.target.name]: ev.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    } else {
      setEditForm({ ...editForm, [e.target.name]: e.target.value });
    }
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    // Always update excerpt from new content
    const excerpt = editForm.content.slice(0, 90) + (editForm.content.length > 90 ? '...' : '');
    const updated = { ...blog, ...editForm, excerpt };
    await editPost(blog._id, updated);
    setEditMode(false);
  };

  if (!blog) {
    return (
      <section className="blog-detail-section-modern">
        <div className="blog-detail-container">
          <div className="blog-detail-nav">
            <button className="blog-back-btn-modern" onClick={() => navigate('/')}>
              <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              <span>Back to Home</span>
            </button>
          </div>
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <h2>Blog post not found</h2>
            <p>The blog post you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="blog-detail-section-modern">
      {/* Artistic Background Elements */}
      <div className="blog-detail-background">
        <div className="blog-detail-art-element detail-element-1"></div>
        <div className="blog-detail-art-element detail-element-2"></div>
        <div className="blog-detail-art-element detail-element-3"></div>
      </div>

      <div className="blog-detail-container">
        {/* Modern Navigation */}
        <div className="blog-detail-nav">
          <button className="blog-back-btn-modern" onClick={() => navigate('/')}>
            <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span>Back to Home</span>
          </button>
        </div>

        {/* Modern Admin Controls */}
        {isAdmin && (
          <div className="blog-detail-admin-controls">
            <button
              onClick={() => setShowForm(f => !f)}
              className="blog-detail-admin-btn primary"
            >
              <span className="admin-btn-icon">{showForm ? '✕' : '+'}</span>
              <span>{showForm ? 'Cancel' : 'Add Post'}</span>
            </button>
            <button
              onClick={handleDeletePost}
              className="blog-detail-admin-btn danger"
            >
              <span className="admin-btn-icon">🗑️</span>
              <span>Delete</span>
            </button>
            <button
              onClick={startEdit}
              className="blog-detail-admin-btn edit"
            >
              <span className="admin-btn-icon">✏️</span>
              <span>Edit</span>
            </button>
          </div>
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
              Video (optional):
              <input type="file" name="video" accept="video/*" onChange={handleFormChange} />
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
              Video (optional):
              <input type="file" name="video" accept="video/*" onChange={handleEditFormChange} />
            </label>
            <label>
              Content:
              <textarea name="content" value={editForm.content} onChange={handleEditFormChange} required></textarea>
            </label>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setEditMode(false)} style={{marginLeft:8}}>Cancel</button>
          </form>
        )}
        {/* Modern Blog Content */}
        <article className="blog-detail-article">
          <div className="blog-detail-header">
            <div className="blog-detail-image-container">
              <img src={blog.image} alt={blog.title} className="blog-detail-img-modern" />
              <div className="blog-detail-image-overlay"></div>
            </div>

            <div className="blog-detail-meta">
              <h1 className="blog-detail-title-modern">{blog.title}</h1>
              <div className="blog-detail-date">
                <svg className="date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>{blog.timestamp ? new Date(blog.timestamp).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'No date'}</span>
              </div>
            </div>
          </div>

          <div className="blog-detail-content-modern">
            {blog.content.split(/\r?\n/).map((para, idx) =>
              para.trim() ? (
                <p key={idx} className="blog-paragraph">
                  {renderContentWithLinks(para)}
                </p>
              ) : (
                <br key={idx} />
              )
            )}
            {blog.video && (
              <div className="blog-video-container">
                <video
                  className="blog-detail-video"
                  controls
                  src={blog.video}
                  style={{ maxWidth: '100%', height: 'auto' }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>
        </article>
        {/* Modern Comments Section */}
        <section className="blog-comments-modern">
          <div className="comments-header">
            <h3 className="comments-title">
              <svg className="comments-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
              </svg>
              Comments ({blogComments.length})
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="blog-comment-form-modern">
            <div className="comment-form-header">
              <h4 className="comment-form-title">Join the conversation</h4>
            </div>

            <div className="comment-form-fields">
              <div className="comment-name-section">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="blog-comment-name-modern"
                  disabled={anonymous}
                />
                <label className="blog-anon-label-modern">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={() => setAnonymous(!anonymous)}
                    className="anon-checkbox"
                  />
                  <span className="anon-text">Comment anonymously</span>
                </label>
              </div>

              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Share your thoughts..."
                className="blog-comment-input-modern"
                rows={4}
                required
              />

              <button type="submit" className="blog-comment-submit-modern">
                <span className="submit-icon">💬</span>
                <span>Post Comment</span>
              </button>
            </div>
          </form>

          <div className="blog-comment-list-modern">
            {blogComments.length === 0 ? (
              <div className="comments-empty-state">
                <div className="empty-comments-icon">💭</div>
                <p className="empty-comments-text">No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              blogComments.map((c, i) => (
                <div key={c._id || i} className="blog-comment-item-modern">
                  <div className="comment-avatar">
                    {c.name ? c.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <strong className="comment-author">{c.name || 'Anonymous'}</strong>
                      <span className="comment-date">
                        {c.timestamp ? formatTimestamp(c.timestamp) : 'Just now'}
                      </span>
                    </div>
                    <p className="comment-text">{c.text}</p>
                    {isAdmin && (
                      <button
                        className="comment-delete-btn"
                        onClick={() => handleDeleteComment(c._id)}
                        title="Delete comment"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

// All API calls updated to use https://aau-nightlife-production.up.railway.app/api/... instead of localhost:5000
