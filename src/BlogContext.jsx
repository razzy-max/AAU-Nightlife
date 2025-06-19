import React, { createContext, useContext, useState, useEffect } from 'react';

const BlogContext = createContext();
const API_URL = 'https://aau-nightlife-production.up.railway.app';

export function BlogProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});

  // Fetch posts from server
  const fetchPosts = async () => {
    const res = await fetch(`${API_URL}/api/blog-posts`);
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
  };

  // Fetch comments from server
  const fetchComments = async () => {
    const res = await fetch(`${API_URL}/api/blog-comments`);
    const data = await res.json();
    setComments(data || {});
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchComments();
  }, []);

  // Add new post and sync to server
  const addPost = async (post) => {
    const res = await fetch(`${API_URL}/api/blog-posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    if (res.ok) {
      await fetchPosts();
      return await res.json();
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
      await fetchPosts();
    }
  };

  // Remove post and sync to server
  const removePost = async (id) => {
    await fetch(`${API_URL}/api/blog-posts/${id}`, { method: 'DELETE' });
    await fetchPosts();
  };

  // Add new comment and sync to server
  const addComment = async (blogId, comment) => {
    const res = await fetch(`${API_URL}/api/blog-comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blogId, ...comment })
    });
    if (res.ok) {
      await fetchComments();
    }
  };

  // Remove comment and sync to server
  const removeComment = async (blogId, commentId) => {
    await fetch(`${API_URL}/api/blog-comments/${commentId}`, { method: 'DELETE' });
    await fetchComments();
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
