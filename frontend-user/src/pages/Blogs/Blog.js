// src/pages/Blog/Blog.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BlogCard from '../../components/BlogCard/BlogCard';
import Pagination from '../../components/Pagination/Pagination';
import { blogService } from '../../services/blogService';
import { categoryService } from '../../services/categoryService'; // <-- Đảm bảo import đúng
import { FaSearch, FaHome } from 'react-icons/fa'; // <-- Import FaHome icon
import './Blog.css';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'; // Import Breadcrumb component

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
  const [inputSearchValue, setInputSearchValue] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
  const [categories, setCategories] = useState([]);

  // EFFECT 1: Phân tích các tham số truy vấn từ URL và cập nhật state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = parseInt(params.get('page') || '1', 10);
    const title = params.get('title') || '';
    const category = params.get('category') || '';
    const size = parseInt(params.get('pageSize') || '6', 10);

    setCurrentPage(page);
    setSearchTitle(title);
    setInputSearchValue(title); // Đồng bộ inputSearchValue với URL
    setSelectedCategorySlug(category);
    setPageSize(size);
  }, [location.search]);

  // Hàm memoized để tìm nạp bài viết dựa trên các state hiện tại
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

      const response = await blogService.getBlogs(params);
      console.log("Response data:", response.data); 
      const responseData = response.data;
      if (responseData && responseData.content) {
        setBlogs(responseData.content);
        setTotalPages(responseData.totalPages);
      } else {
        setError(responseData.message || 'Không thể tải bài viết.');
        setBlogs([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách blog:", err);
      setError('Đã xảy ra lỗi khi tải bài viết.');
      setBlogs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTitle, selectedCategorySlug]);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, searchTitle, selectedCategorySlug, pageSize, fetchBlogs]);

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

  const buildAndNavigate = useCallback((newTitle, newCategory, newPage) => {
    const queryParams = new URLSearchParams();
    if (newPage !== 1) queryParams.set('page', newPage);
    if (newTitle) queryParams.set('title', newTitle);
    if (newCategory) queryParams.set('category', newCategory);
    queryParams.set('pageSize', pageSize);

    const newPath = `?${queryParams.toString()}`;
    if (location.search !== newPath) {
      navigate(newPath, { replace: true });
    }
  }, [navigate, pageSize, location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    buildAndNavigate(inputSearchValue, selectedCategorySlug, 1);
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    buildAndNavigate(searchTitle, newCategory, 1);
  };

  const handlePageChange = (page) => {
    buildAndNavigate(searchTitle, selectedCategorySlug, page);
  };

  // --- LOGIC CHO BREADCRUMB ---
  const breadcrumbItems = useMemo(() => {
    const items = [
      { label: 'Trang chủ', path: '/', icon: <FaHome /> }, // <-- Thêm icon FaHome tại đây
      { label: 'Blog', path: '/blog' },
    ];

    if (selectedCategorySlug) {
      const currentCategory = categories.find(cat => cat.slug === selectedCategorySlug);
      if (currentCategory) {
        items.push({ label: currentCategory.name, path: `/blog?category=${selectedCategorySlug}` });
      }
    }
    return items;
  }, [selectedCategorySlug, categories]);

  return (
    <div className="blog-page redesigned-blog-page">
      <div className="blog-hero-section">
        <div className="blog-hero-bg">
          <div className="blog-hero-overlay" />
        </div>
        <div className="blog-hero-content container">
          <h1 className="blog-page-title">Tin tức & Blog Sức Khỏe</h1>
          <p className="blog-page-desc">Khám phá các bài viết, tin tức và kiến thức sức khỏe mới nhất từ các chuyên gia và nhà thuốc.</p>
        </div>
      </div>

      <div className="container blog-main-content">
        <Breadcrumb items={breadcrumbItems} />

        <div className="blog-filters redesigned-blog-filters">
          <form onSubmit={handleSearchSubmit} className="blog-search-form redesigned-blog-search-form">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={inputSearchValue}
              onChange={(e) => setInputSearchValue(e.target.value)}
              className="blog-search-input redesigned-blog-search-input"
            />
            <button type="submit" className="blog-search-btn redesigned-blog-search-btn">
              <FaSearch />
            </button>
          </form>

          <div className="blog-category-select-wrapper">
            <select
              value={selectedCategorySlug}
              onChange={handleCategoryChange}
              className="blog-category-select redesigned-blog-category-select"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-indicator redesigned-loading-indicator">
            <div className="spinner" /> Đang tải bài viết...
          </div>
        ) : error ? (
          <div className="error-message redesigned-error-message">{error}</div>
        ) : blogs.length === 0 ? (
          <div className="no-results redesigned-no-results">Không tìm thấy bài viết nào phù hợp.</div>
        ) : (
          <>
            <div className="blog-list-grid redesigned-blog-list-grid">
              {blogs.map(blog => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="blog-pagination-wrapper">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Blog;