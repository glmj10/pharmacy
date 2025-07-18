// src/pages/Blog/Blog.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BlogCard from '../../components/BlogCard/BlogCard';
import Pagination from '../../components/Pagination/Pagination';
import { blogService } from '../../services/blogService'; // Import blogService của bạn
import { categoryService } from '../../services/categoryService'; // <--- Đảm bảo import đúng đây
import { FaSearch } from 'react-icons/fa';
import './Blog.css';

const Blog = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = parseInt(params.get('page') || '1', 10);
    const title = params.get('title') || '';
    const category = params.get('category') || '';
    const size = parseInt(params.get('pageSize') || '6', 10);

    setCurrentPage(page);
    setSearchTitle(title);
    setSelectedCategorySlug(category);
    setPageSize(size);
  }, [location.search]);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        pageIndex: currentPage,
        pageSize: pageSize,
      };
      if (searchTitle) {
        params.title = searchTitle;
      }
      if (selectedCategorySlug) {
        params.category = selectedCategorySlug;
      }

      // blogService.getBlogs giờ trả về trực tiếp object { currentPage, totalPages, content }
      const responseData = await blogService.getBlogs(params); 
      
      if (responseData && responseData.content) {
        setBlogs(responseData.content);
        setCurrentPage(responseData.currentPage);
        setTotalPages(responseData.totalPages);
      } else {
        setError(responseData.message || 'Không thể tải bài viết.');
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách blog:", err);
      setError('Đã xảy ra lỗi khi tải bài viết.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTitle, selectedCategorySlug]);

  // Lấy danh sách danh mục cho bộ lọc
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // categoryService.getAllCategories giờ trả về trực tiếp mảng categories
        const categoriesData = await categoryService.getAllCategories(); 
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData.filter(cat => cat.type === 'BLOG'));
        } else {
          console.warn('Unexpected categories response structure:', categoriesData);
          setCategories([]); // Đảm bảo luôn là mảng
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh mục:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []); // Chỉ chạy một lần khi component mount

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (currentPage !== 1) queryParams.set('page', currentPage);
    if (searchTitle) queryParams.set('title', searchTitle);
    if (selectedCategorySlug) queryParams.set('category', selectedCategorySlug);
    queryParams.set('pageSize', pageSize);

    navigate(`?${queryParams.toString()}`, { replace: true });
    fetchBlogs();
  }, [currentPage, searchTitle, selectedCategorySlug, pageSize, navigate, fetchBlogs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategorySlug(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="blog-page">
      <div className="container">
        <h1 className="blog-page-title">Tin tức & Blog Sức Khỏe</h1>

        <div className="blog-filters">
          <form onSubmit={handleSearchSubmit} className="blog-search-form">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="blog-search-input"
            />
            <button type="submit" className="blog-search-btn">
              <FaSearch />
            </button>
          </form>

          <select
            value={selectedCategorySlug}
            onChange={handleCategoryChange}
            className="blog-category-select"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading-indicator">Đang tải bài viết...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : blogs.length === 0 ? (
          <div className="no-results">Không tìm thấy bài viết nào phù hợp.</div>
        ) : (
          <>
            <div className="blog-list-grid">
              {blogs.map(blog => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Blog;