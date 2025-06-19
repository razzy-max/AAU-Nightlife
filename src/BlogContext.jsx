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

  // Fetch comments for all posts
  useEffect(() => {
    async function fetchAllComments() {
      const allComments = {};
      for (const post of posts) {
        const res = await fetch(`${API_URL}/api/blog-comments/${post._id}`);
        const data = await res.json();
        allComments[post._id] = data;
      }
      setComments(allComments);
    }
    if (posts.length > 0) fetchAllComments();
  }, [posts]);

  // Add new post and sync to server
  const addPost = async (post) => {
    const res = await fetch(`${API_URL}/api/blog-posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    if (res.ok) {
      const newPost = await res.json();
      setPosts(prev => [newPost, ...prev]);
    }
  };

  // Update post
  const updatePost = async (id, post) => {
    const res = await fetch(`${API_URL}/api/blog-posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    if (res.ok) {
      const updated = await res.json();
      setPosts(prev => prev.map(p => p._id === id ? updated : p));
    }
  };

  // Remove post
  const removePost = async (id) => {
    const res = await fetch(`${API_URL}/api/blog-posts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setPosts(prev => prev.filter(p => p._id !== id));
    }
  };

  // Add new comment and sync to server
  const addComment = async (blogId, comment) => {
    const res = await fetch(`${API_URL}/api/blog-comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blogId, ...comment })
    });
    if (res.ok) {
      const newComment = await res.json();
      setComments(prev => ({
        ...prev,
        [blogId]: [...(prev[blogId] || []), newComment]
      }));
    }
  };

  // Remove comment
  const removeComment = async (blogId, commentId) => {
    const res = await fetch(`${API_URL}/api/blog-comments/${commentId}`, { method: 'DELETE' });
    if (res.ok) {
      setComments(prev => ({
        ...prev,
        [blogId]: (prev[blogId] || []).filter(c => c._id !== commentId)
      }));
    }
  };

  return (
    <BlogContext.Provider value={{ posts, addPost, removePost, updatePost, comments, addComment, removeComment }}>
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  return useContext(BlogContext);
}
