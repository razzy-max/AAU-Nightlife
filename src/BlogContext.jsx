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

  // Fetch comments from server (persist per blogId)
  useEffect(() => {
    async function fetchAllComments() {
      const res = await fetch(`${API_URL}/api/blog-posts`);
      const blogs = await res.json();
      const commentsObj = {};
      for (const blog of blogs) {
        const resC = await fetch(`${API_URL}/api/blog-comments/${blog._id}`);
        let blogComments = await resC.json();
        commentsObj[blog._id] = blogComments.reverse(); // Reverse to show newest first
      }
      setComments(commentsObj);
    }
    fetchAllComments();
  }, [posts]);

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
      const updatedPost = await res.json();
      setPosts(prev => prev.map(p => String(p._id) === String(id) ? updatedPost : p));
    }
  };

  // Remove post and sync to server
  const removePost = async (id) => {
    await fetch(`${API_URL}/api/blog-posts/${id}`, { method: 'DELETE' });
    setPosts(prev => prev.filter(p => p._id !== id));
  };

  // Add new comment and sync to server
  const addComment = async (blogId, comment) => {
    try {
      const res = await fetch(`${API_URL}/api/blog-comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId: String(blogId), ...comment })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
      }

      await fetchCommentsForBlog(blogId); // Re-fetch to update with newest on top
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error; // Re-throw so the component can handle it
    }
  };

  // Remove comment and sync to server
  const removeComment = async (blogId, commentId) => {
    await fetch(`${API_URL}/api/blog-comments/${commentId}`, { method: 'DELETE' });
    await fetchCommentsForBlog(blogId); // Re-fetch to update with newest on top
  };

  // Helper function to fetch and reverse comments for a specific blog
  const fetchCommentsForBlog = async (blogId) => {
    const res = await fetch(`${API_URL}/api/blog-comments/${blogId}`);
    let blogComments = await res.json();
    setComments(prev => ({ ...prev, [blogId]: blogComments.reverse() }));
  };

  return (
    <BlogContext.Provider value={{ posts, addPost, editPost, removePost, comments, addComment, removeComment, fetchCommentsForBlog }}>
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  return useContext(BlogContext);
}