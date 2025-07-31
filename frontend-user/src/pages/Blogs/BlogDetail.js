import React, { useState, useEffect, useCallback, useMemo } from 'react'; 
import { useParams, Link } from 'react-router-dom';
import { blogService } from '../../services/blogService';
import { categoryService } from '../../services/categoryService'; 
import { FaCalendarAlt, FaTag, FaHome } from 'react-icons/fa'; 
import './BlogDetail.css';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'; 

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]); 

  const fetchBlog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.getBlogsBySlug(slug);
      const blogData = response.data;

      if (blogData) {
        setBlog(blogData);
      } else {
        setError('Không tìm thấy bài viết hoặc bài viết không có dữ liệu.');
        setBlog(null);
      }
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết blog:", err);
      if (err.response && err.response.status === 404) {
        setError('Bài viết bạn đang tìm kiếm không tồn tại.');
      } else {
        setError('Đã xảy ra lỗi khi tải chi tiết bài viết.');
      }
      setBlog(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        const categoriesData = response.data || [];
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData.filter(cat => cat.type === 'BLOG'));
        } else {
          console.warn('Unexpected categories response structure:', categoriesData);
          setCategories([]);
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh mục:", err);
        setCategories([]);
      }
    };
    getCategories();
  }, []); 

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

  const breadcrumbItems = useMemo(() => {
    const items = [
      { label: 'Trang chủ', path: '/', icon: <FaHome /> },
      { label: 'Blog', path: '/blog' },
    ];

    if (blog && blog.category?.slug) {
      const categoryName = categories.find(cat => cat.slug === blog.category.slug)?.name || blog.category.name;
      items.push({ label: categoryName, path: `/blog?category=${blog.category.slug}` });
    }

    if (blog) {
      items.push({ label: blog.title }); 
    }

    return items;
  }, [blog, categories]); 

  if (loading) {
    return (
      <div className="blog-detail-page container">
        <Breadcrumb items={breadcrumbItems} />
        <div className="loading-indicator">Đang tải chi tiết bài viết...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-detail-page container">
        <Breadcrumb items={breadcrumbItems} /> 
        <div className="error-message">{error}</div>
        <div style={{textAlign: 'center', marginTop: 'var(--spacing-md)'}}>
          <Link to="/blog" className="back-to-blog-list">Quay lại danh sách blog</Link>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-detail-page container">
        <Breadcrumb items={breadcrumbItems} /> 
        <div className="no-blog-found">Bài viết không tồn tại hoặc đã bị xóa.</div>
        <div style={{textAlign: 'center', marginTop: 'var(--spacing-md)'}}>
          <Link to="/blog" className="back-to-blog-list">Quay lại danh sách blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="container">
        <Breadcrumb items={breadcrumbItems} />

        <div className="blog-detail-header">
          <h1 className="blog-detail-title">{blog.title}</h1>
          <div className="blog-detail-meta">
            <span className="blog-detail-date">
              <FaCalendarAlt /> {formatDate(blog.createdAt)}
            </span>
            <span className="blog-detail-category">
              <FaTag /> 
              <Link to={`/blog?category=${blog.category?.slug}`} className="meta-category-link">
                {blog.category?.name || 'Chung'}
              </Link>
            </span>
          </div>
        </div>
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