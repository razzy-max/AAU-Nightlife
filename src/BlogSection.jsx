import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import './BlogSection.css';
import { useBlog } from './BlogContext';

export default function BlogSection() {
  const { posts } = useBlog();
  return (
    <section className="blog-section">
      <h2 className="blog-section-title">Latest from Our Blog</h2>
      <div className="blog-cards">
        {posts.map(post => (
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
