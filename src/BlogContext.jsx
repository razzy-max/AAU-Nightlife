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
      setPosts(prev => [post, ...prev]);
    }
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

  // Remove post locally (admin only)
  const removePost = (id) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    // Optionally, add a DELETE endpoint for full sync
  };

  // Remove comment locally (admin only)
  const removeComment = (blogId, idx) => {
    setComments(prev => ({
      ...prev,
      [blogId]: prev[blogId].filter((_, i) => i !== idx)
    }));
    // Optionally, add a PUT endpoint for full sync
  };

  return (
    <BlogContext.Provider value={{ posts, addPost, removePost, comments, addComment, removeComment }}>
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  return useContext(BlogContext);
}
