import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import './BlogSection.css';
import { useBlog } from './BlogContext';

export default function BlogSection() {
  const { posts, addPost, removePost, updatePost, comments, addComment, removeComment } = useBlog();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', image: '', content: '' });
  const [editId, setEditId] = useState(null);
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
    const newPost = { ...form, excerpt };
    if (editId) {
      await updatePost(editId, newPost);
    } else {
      await addPost(newPost);
    }
    setForm({ title: '', image: '', content: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = post => {
    setForm({ title: post.title, image: post.image, content: post.content });
    setEditId(post._id);
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (window.confirm('Delete this blog post?')) {
      await removePost(id);
    }
  };

  // Comments
  const [commentText, setCommentText] = useState('');
  const [commentingId, setCommentingId] = useState(null);

  const handleAddComment = async (blogId) => {
    if (!commentText.trim()) return;
    await addComment(blogId, { text: commentText, date: new Date().toISOString() });
    setCommentText('');
    setCommentingId(null);
  };

  const handleDeleteComment = async (blogId, commentId) => {
    if (window.confirm('Delete this comment?')) {
      await removeComment(blogId, commentId);
    }
  };

  return (
    <section className="blog-section">
      <h2 className="blog-section-title">Latest from Our Blog</h2>
      {isAdmin && (
        <button onClick={() => { setShowForm(f => !f); setEditId(null); setForm({ title: '', image: '', content: '' }); }} style={{marginBottom: '1rem'}}>
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
            <input type="file" name="image" accept="image/*" onChange={handleFormChange} required={!editId} />
          </label>
          <label>
            Content:
            <textarea name="content" value={form.content} onChange={handleFormChange} required></textarea>
          </label>
          <button type="submit">{editId ? 'Update Blog Post' : 'Add Blog Post'}</button>
        </form>
      )}
      <div className="blog-cards">
        {posts.map(post => (
          <div className="blog-card" key={post._id}>
            <img src={post.image} alt={post.title} className="blog-card-img" />
            <div className="blog-card-body">
              <h3 className="blog-card-title">{post.title}</h3>
              <p className="blog-card-excerpt">{post.excerpt || (post.content && post.content.slice(0, 90) + '...')}</p>
              <Link to={`/blog/${post._id}`} className="blog-card-btn">Read More</Link>
              {isAdmin && (
                <div style={{marginTop: '1rem', display: 'flex', gap: '0.7rem'}}>
                  <button onClick={() => handleEdit(post)}>Edit</button>
                  <button onClick={() => handleDelete(post._id)}>Delete</button>
                </div>
              )}
            </div>
            {/* Comments Section */}
            <div className="blog-comments">
              <h4 style={{color:'#fff', margin:'1rem 0 0.5rem'}}>Comments</h4>
              <ul style={{padding:0, listStyle:'none'}}>
                {(comments[post._id] || []).map((c, idx) => (
                  <li key={c._id || idx} style={{background:'#23243a', color:'#fff', borderRadius:8, marginBottom:6, padding:'0.5rem 0.7rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span>{c.text}</span>
                    {isAdmin && <button onClick={() => handleDeleteComment(post._id, c._id)}>Delete</button>}
                  </li>
                ))}
              </ul>
              <div style={{display:'flex', gap:'0.5rem', marginTop:'0.5rem'}}>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentingId === post._id ? commentText : ''}
                  onChange={e => { setCommentingId(post._id); setCommentText(e.target.value); }}
                  style={{flex:1, borderRadius:6, border:'1px solid #ccc', padding:'0.4rem'}}
                />
                <button onClick={() => handleAddComment(post._id)} style={{borderRadius:6}}>Post</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
