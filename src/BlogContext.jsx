import React, { createContext, useContext, useState, useEffect } from 'react';

const initialBlogPosts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
    title: 'Top 5 Nightlife Spots in Ekpoma',
    content: 'Full article content for Top 5 Nightlife Spots in Ekpoma. Discover the best places to unwind and have fun in Ekpoma. From clubs to lounges, here are our top picks for students. (Add more content as needed.)',
    excerpt: 'Discover the best places to unwind and have fun in Ekpoma. From clubs to lounges, here are our top picks for students.'
  },
  // ...copy the rest of your initial posts here, including excerpt fields
];

const BlogContext = createContext();

export function BlogProvider({ children }) {
  // Load posts from localStorage or use initial
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('aau_blog_posts');
    return saved ? JSON.parse(saved) : initialBlogPosts;
  });
  // Comments: { [blogId]: [ {name, text}, ... ] }
  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem('aau_blog_comments');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('aau_blog_posts', JSON.stringify(posts));
  }, [posts]);
  useEffect(() => {
    localStorage.setItem('aau_blog_comments', JSON.stringify(comments));
  }, [comments]);

  return (
    <BlogContext.Provider value={{ posts, setPosts, comments, setComments }}>
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  return useContext(BlogContext);
}
