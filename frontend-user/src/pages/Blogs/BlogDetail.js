import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogService } from '../../services/blogService'; // Đảm bảo đúng đường dẫn đến blogService của bạn
import { FaCalendarAlt, FaTag } from 'react-icons/fa';
import './BlogDetail.css'; // Import CSS cho trang chi tiết blog

const BlogDetail = () => {
  const { slug } = useParams(); // Lấy slug từ URL (ví dụ: /blog/ten-bai-viet-cua-ban)
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm để gọi API lấy chi tiết bài viết theo slug
  const fetchBlog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // blogService.getBlogsBySlug giờ trả về trực tiếp object blog
      const blogData = await blogService.getBlogsBySlug(slug);
      
      if (blogData) {
        setBlog(blogData);
      } else {
        setError('Không tìm thấy bài viết hoặc bài viết không có dữ liệu.');
        setBlog(null);
      }
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết blog:", err);
      // Kiểm tra lỗi 404 (Not Found) từ API nếu có
      if (err.response && err.response.status === 404) {
        setError('Bài viết bạn đang tìm kiếm không tồn tại.');
      } else {
        setError('Đã xảy ra lỗi khi tải chi tiết bài viết.');
      }
      setBlog(null);
    } finally {
      setLoading(false);
    }
  }, [slug]); // `useCallback` để hàm không bị tạo lại mỗi khi component render, chỉ khi `slug` thay đổi

  // Chạy `fetchBlog` mỗi khi `slug` thay đổi (do URL thay đổi)
  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]); // Dependency array bao gồm `fetchBlog`

  // Hàm định dạng ngày tháng
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Hiển thị trạng thái tải
  if (loading) {
    return (
      <div className="blog-detail-page container">
        <div className="loading-indicator">Đang tải chi tiết bài viết...</div>
      </div>
    );
  }

  // Hiển thị trạng thái lỗi
  if (error) {
    return (
      <div className="blog-detail-page container">
        <div className="error-message">{error}</div>
        <div style={{textAlign: 'center', marginTop: 'var(--spacing-md)'}}>
          {/* Link quay lại danh sách blog */}
          <Link to="/blog" className="back-to-blog-list">Quay lại danh sách blog</Link>
        </div>
      </div>
    );
  }

  // Hiển thị khi không tìm thấy blog (sau khi tải xong và không có lỗi nhưng blog là null)
  if (!blog) {
    return (
      <div className="blog-detail-page container">
        <div className="no-blog-found">Bài viết không tồn tại hoặc đã bị xóa.</div>
        <div style={{textAlign: 'center', marginTop: 'var(--spacing-md)'}}>
          <Link to="/blog" className="back-to-blog-list">Quay lại danh sách blog</Link>
        </div>
      </div>
    );
  }

  // Giao diện chính của trang chi tiết blog
  return (
    <div className="blog-detail-page">
      <div className="container"> {/* Sử dụng container đã định nghĩa trong CSS toàn cục */}
        <div className="blog-detail-header">
          <h1 className="blog-detail-title">{blog.title}</h1>
          <div className="blog-detail-meta">
            <span className="blog-detail-date">
              <FaCalendarAlt /> {formatDate(blog.createdAt)}
            </span>
            <span className="blog-detail-category">
              <FaTag /> 
              {/* Liên kết đến trang danh sách blog đã lọc theo danh mục */}
              <Link to={`/blog?category=${blog.category?.slug}`} className="meta-category-link">
                {blog.category?.name || 'Chung'}
              </Link>
            </span>
          </div>
        </div>

        {blog.thumbnail && ( // Chỉ hiển thị thumbnail nếu có
          <div className="blog-detail-thumbnail">
            <img 
              src={blog.thumbnail} 
              alt={blog.title} 
              // Fallback image nếu thumbnail bị lỗi
              onError={(e) => { e.target.src = 'https://via.placeholder.com/800x450/ccc/fff?text=No+Image'; }}
            />
          </div>
        )}

        {/* Render nội dung HTML từ API. 
            Sử dụng dangerouslySetInnerHTML cần cẩn thận với XSS attacks.
            Đảm bảo nội dung từ API đã được làm sạch an toàn.
        */}
        <div className="blog-detail-content" dangerouslySetInnerHTML={{ __html: blog.content }}>
        </div>

        <div className="blog-detail-footer">
          <Link to="/blog" className="back-to-blog-list">
            ← Quay lại danh sách blog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;