import React from 'react';
import { Link } from 'react-router-dom';
import './BlogCard.css';

const BlogCard = ({ blog }) => {
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Link to={`/blog/${blog.slug}`} className="blog-card">
      <div className="blog-card-thumbnail">
        <img 
          src={blog.thumbnail || 'https://via.placeholder.com/400x250/ccc/fff?text=No+Image'} 
          alt={blog.title} 
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x250/ccc/fff?text=No+Image'; }}
        />
      </div>
      <div className="blog-card-content">
        <p className="blog-card-category">{blog.category?.name || 'Chung'}</p>
        <h3 className="blog-card-title">{blog.title}</h3>
        <p className="blog-card-date">{formatDate(blog.createdAt)}</p>
      </div>
    </Link>
  );
};

export default BlogCard;