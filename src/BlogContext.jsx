import React, { createContext, useContext, useState, useEffect } from 'react';

const BlogContext = createContext();
const API_URL = 'https://aau-nightlife-production.up.railway.app';

export function BlogProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});

  // Fetch posts from server
  useEffect(() => {
    fetch(`${API_URL}/api/blog-posts`)
      .then(res => res.json())
      .then(data => setPosts(Array.isArray(data) ? data : []));
  }, []);

  // Fetch comments from server
  useEffect(() => {
    fetch(`${API_URL}/api/blog-comments`)
      .then(res => res.json())
      .then(data => setComments(data || {}));
  }, []);

  // Add new post and sync to server
  const addPost = async (post) => {
    const res = await fetch(`${API_URL}/api/blog-posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    if (res.ok) {
      const created = await res.json();
      setPosts(prev => [created, ...prev]);
      return created;
    }
  };

  // Edit post and sync to server
  const editPost = async (id, updated) => {
    const res = await fetch(`${API_URL}/api/blog-posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (res.ok) {
      setPosts(prev => prev.map(p => p._id === id ? { ...p, ...updated } : p));
    }
  };

  // Remove post and sync to server
  const removePost = async (id) => {
    await fetch(`${API_URL}/api/blog-posts/${id}`, { method: 'DELETE' });
    setPosts(prev => prev.filter(p => p._id !== id));
  };

  // Add new comment and sync to server
  const addComment = async (blogId, comment) => {
    const res = await fetch(`${API_URL}/api/blog-comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blogId, comment })
    });
    if (res.ok) {
      setComments(prev => ({
        ...prev,
        [blogId]: [...(prev[blogId] || []), comment]
      }));
    }
  };

  // Remove comment and sync to server
  const removeComment = async (blogId, idx) => {
    // Optionally, you can sync with backend if you have comment IDs
    setComments(prev => ({
      ...prev,
      [blogId]: prev[blogId].filter((_, i) => i !== idx)
    }));
  };

  return (
    <BlogContext.Provider value={{ posts, addPost, editPost, removePost, comments, addComment, removeComment }}>
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  return useContext(BlogContext);
}
