import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import brandService from '../../services/brandService';
import { wishlistService } from '../../services/wishlistService';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthAction } from '../../hooks/useAuthAction';
import { FaShoppingCart, FaHeart, FaEye, FaChevronRight, FaHome } from 'react-icons/fa';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [childCategories, setChildCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    title: searchParams.get('title') || '',
    categorySlug: searchParams.get('categorySlug') || '',
    brandSlug: searchParams.get('brandSlug') || '',
    priceFrom: searchParams.get('priceFrom') || '',
    priceTo: searchParams.get('priceTo') || '',
    isAscending: searchParams.get('isAscending') !== null ? searchParams.get('isAscending') === 'true' : null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12; // 12 products per page as requested

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { executeWithAuth } = useAuthAction();

  // State cho wishlist
  const [wishlistItems, setWishlistItems] = useState([]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getAllCategories();
      
      // Handle ApiResponse<List<CategoryResponse>> structure
      // categoryService.getAllCategories() returns response.data
      if (response?.data && Array.isArray(response.data)) {
        // Case: ApiResponse { data: List<CategoryResponse> }
        setCategories(response.data);
      } else if (Array.isArray(response)) {
        // Case: Direct array response
        setCategories(response);
      } else {
        console.warn('Unexpected categories response structure:', response);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const response = await brandService.getAllBrands();
      
      console.log('Brands response:', response);
      
      // Handle ApiResponse<List<BrandResponse>> structure
      // brandService.getAllBrands() returns response.data
      if (response?.data && Array.isArray(response.data)) {
        // Case: ApiResponse { data: List<BrandResponse> }
        console.log('Using response.data:', response.data);
        setBrands(response.data);
      } else if (Array.isArray(response)) {
        // Case: Direct array response
        console.log('Using response:', response);
        setBrands(response);
      } else {
        console.warn('Unexpected brands response structure:', response);
        console.log('Setting empty brands array');
        setBrands([]);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    }
  }, []);

  const fetchChildCategories = useCallback(async (parentSlug) => {
    try {
      const response = await categoryService.getCategoriesByParentSlug(parentSlug);
      
      // Handle ApiResponse<List<CategoryParentAndChildResponse>> structure
      // categoryService.getCategoriesByParentSlug() returns response.data
      if (response?.data && Array.isArray(response.data)) {
        // Extract all children from all parent-child pairs
        const allChildren = response.data.flatMap(item => item.children || []);
        setChildCategories(allChildren);
      } else if (Array.isArray(response)) {
        // Direct array response
        const allChildren = response.flatMap(item => item.children || []);
        setChildCategories(allChildren);
      } else {
        console.warn('Unexpected child categories response structure:', response);
        setChildCategories([]);
      }
    } catch (error) {
      console.error('Error fetching child categories:', error);
      setChildCategories([]);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        pageIndex: currentPage,
        pageSize: itemsPerPage,
        title: filters.title,
        categorySlug: filters.categorySlug,
        brandSlug: filters.brandSlug,
        priceFrom: filters.priceFrom ? parseInt(filters.priceFrom) : undefined,
        priceTo: filters.priceTo ? parseInt(filters.priceTo) : undefined,
        isAscending: filters.isAscending
      };
      
      // Remove undefined/empty values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });
      
      const response = await productService.getAllProducts(params);
      
      console.log('Products API response:', response);
      console.log('Response structure:', response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Handle different response structures
      let productsData;
      let totalPagesData;
      let totalElementsData;
      
      if (response && response.data && response.data.content) {
        // Case: ApiResponse { data: PageResponse { content: [...], totalPages, totalElements } }
        productsData = response.data.content;
        totalPagesData = response.data.totalPages;
        totalElementsData = response.data.totalElements;
        console.log('Using response.data structure');
      } else if (response && response.content) {
        // Case: PageResponse { content: [...], totalPages, totalElements }
        productsData = response.content;
        totalPagesData = response.totalPages;
        totalElementsData = response.totalElements;
        console.log('Using direct response structure');
      } else if (Array.isArray(response)) {
        // Case: Array of products (fallback)
        productsData = response;
        totalPagesData = 1;
        totalElementsData = response.length;
        console.log('Using array response structure');
      } else {
        console.warn('Unexpected products response structure:', response);
        productsData = [];
        totalPagesData = 1;
        totalElementsData = 0;
      }
      
      setProducts(productsData || []);
      setTotalItems(totalElementsData || 0);
      setTotalPages(totalPagesData || 1);
      
      console.log('Set products:', (productsData || []).length);
      console.log('Set totalPages:', totalPagesData);
      console.log('Set totalItems:', totalElementsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filters]);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }
    
    try {
      const response = await wishlistService.getWishlist();
      if (response?.data && Array.isArray(response.data)) {
        setWishlistItems(response.data.map(item => item.productId || item.id));
      } else if (Array.isArray(response)) {
        setWishlistItems(response.map(item => item.productId || item.id));
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistItems([]);
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Load child categories if current categorySlug is a parent category
  useEffect(() => {
    if (filters.categorySlug && categories.length > 0) {
      const isParentCategory = categories.some(cat => cat.slug === filters.categorySlug);
      if (isParentCategory) {
        fetchChildCategories(filters.categorySlug);
      }
    }
  }, [filters.categorySlug, categories, fetchChildCategories]);

  // Fetch wishlist when user logs in or out
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL params
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newParams.set(k, v);
    });
    setSearchParams(newParams);
  };

  const handleAddToCart = executeWithAuth(async (product) => {
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  });

  const handleWishlistToggle = executeWithAuth(async (product) => {
    try {
      const isInWishlist = wishlistItems.includes(product.id);
      
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(product.id);
        setWishlistItems(prev => prev.filter(id => id !== product.id));
      } else {
        await wishlistService.addToWishlist(product.id);
        setWishlistItems(prev => [...prev, product.id]);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  });

  const handleProductClick = (productSlug) => {
    navigate(`/products/${productSlug}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          ««
        </button>
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹
        </button>
        {pages}
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          ›
        </button>
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          »»
        </button>
      </div>
    );
  };

  // Get current category name for breadcrumb
  const getCurrentCategoryName = () => {
    if (!filters.categorySlug) return null;
    
    // First check in main categories
    const currentCategory = categories.find(cat => cat.slug === filters.categorySlug);
    if (currentCategory) {
      return currentCategory.name;
    }
    
    // Then check in child categories
    const currentChildCategory = childCategories.find(cat => cat.slug === filters.categorySlug);
    if (currentChildCategory) {
      return currentChildCategory.name;
    }
    
    return null;
  };

  const renderBreadcrumb = () => {
    const categoryName = getCurrentCategoryName();
    
    return (
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-item">
          <FaHome />
          Trang chủ
        </Link>
        <FaChevronRight className="breadcrumb-separator" />
        <Link to="/products" className="breadcrumb-item">
          Sản phẩm
        </Link>
        {categoryName && (
          <>
            <FaChevronRight className="breadcrumb-separator" />
            <span className="breadcrumb-item active">{categoryName}</span>
          </>
        )}
      </nav>
    );
  };

  return (
    <div className="products-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        {renderBreadcrumb()}

        {/* Categories Section */}
        <div className="categories-section">
          <h2>Danh mục sản phẩm</h2>
          <div className="categories-grid">
            {categories.slice(0, 8).map(category => (
              <div 
                key={category.id} 
                className={`category-card ${filters.categorySlug === category.slug ? 'active' : ''}`}
                onClick={() => {
                  const newCategorySlug = filters.categorySlug === category.slug ? '' : category.slug;
                  handleFilterChange('categorySlug', newCategorySlug);
                  
                  if (newCategorySlug) {
                    fetchChildCategories(newCategorySlug);
                  } else {
                    setChildCategories([]);
                  }
                }}
              >
                <div className="category-thumbnail">
                  <img 
                    src={category.thumbnail || '/api/placeholder/140/140'} 
                    alt={category.name}
                    onError={(e) => {
                      e.target.src = '/api/placeholder/140/140';
                    }}
                  />
                </div>
                <h3>{category.name}</h3>
              </div>
            ))}
          </div>
        </div>

        <div className="products-content">
          {/* Filters Sidebar */}
          <div className="filters-sidebar">
            <div className="filter-section">
              <h3>Thiết lập lại</h3>
              <button 
                className="apply-filters-btn"
                onClick={() => {
                  setFilters({
                    title: '',
                    categorySlug: '',
                    brandSlug: '',
                    priceFrom: '',
                    priceTo: '',
                    isAscending: null
                  });
                  setChildCategories([]);
                  setSearchParams(new URLSearchParams());
                }}
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
            <div className="filter-section">
              <h3>Bộ lọc</h3>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={filters.title}
                onChange={(e) => handleFilterChange('title', e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-section">
              <h3>Sắp xếp theo:</h3>
              <div className="sort-buttons">
                <button 
                  className={`sort-btn ${filters.isAscending === true ? 'active' : ''}`}
                  onClick={() => handleFilterChange('isAscending', true)}
                >
                  Giá tăng dần
                </button>
                <button 
                  className={`sort-btn ${filters.isAscending === false ? 'active' : ''}`}
                  onClick={() => handleFilterChange('isAscending', false)}
                >
                  Giá giảm dần
                </button>
              </div>
            </div>

            <div className="filter-section">
              <h3>Khoảng giá</h3>
              <div className="price-range-buttons">
                <button 
                  className={`price-range-btn ${filters.priceFrom === '0' && filters.priceTo === '100000' ? 'active' : ''}`}
                  onClick={() => {
                    handleFilterChange('priceFrom', '0');
                    handleFilterChange('priceTo', '100000');
                  }}
                >
                  Dưới 100.000 ₫
                </button>
                <button 
                  className={`price-range-btn ${filters.priceFrom === '100000' && filters.priceTo === '300000' ? 'active' : ''}`}
                  onClick={() => {
                    handleFilterChange('priceFrom', '100000');
                    handleFilterChange('priceTo', '300000');
                  }}
                >
                  100.000 ₫ - 300.000 ₫
                </button>
                <button 
                  className={`price-range-btn ${filters.priceFrom === '300000' && filters.priceTo === '500000' ? 'active' : ''}`}
                  onClick={() => {
                    handleFilterChange('priceFrom', '300000');
                    handleFilterChange('priceTo', '500000');
                  }}
                >
                  300.000 ₫ - 500.000 ₫
                </button>
                <button 
                  className={`price-range-btn ${filters.priceFrom === '500000' && filters.priceTo === '' ? 'active' : ''}`}
                  onClick={() => {
                    handleFilterChange('priceFrom', '500000');
                    handleFilterChange('priceTo', '');
                  }}
                >
                  Trên 500.000 ₫
                </button>
              </div>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  value={filters.priceFrom}
                  onChange={(e) => handleFilterChange('priceFrom', e.target.value)}
                  className="price-input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Tối đa"
                  value={filters.priceTo}
                  onChange={(e) => handleFilterChange('priceTo', e.target.value)}
                  className="price-input"
                />
              </div>
              <button 
                className="apply-filters-btn"
                onClick={() => {
                  // Trigger refetch with current filters
                  fetchProducts();
                }}
              >
                Áp dụng
              </button>
            </div>

            <div className="filter-section">
              <h3>Thương hiệu</h3>
              <select
                value={filters.brandSlug}
                onChange={(e) => handleFilterChange('brandSlug', e.target.value)}
                className="filter-select"
              >
                <option value="">Tất cả thương hiệu</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.slug}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="products-main">
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Đang tải sản phẩm...</p>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map(product => (
                    <div key={product.id} className="product-card">
                      <div className="product-image" onClick={() => handleProductClick(product.slug)}>
                        <img
                          src={product.thumbnailUrl || '/api/placeholder/300/300'}
                          alt={product.title}
                          onError={(e) => {
                            e.target.src = '/api/placeholder/300/300';
                          }}
                        />
                        <div className="product-badges">
                          {product.priceOld && product.priceNew && product.priceOld > product.priceNew && (
                            <span className="badge badge-discount">
                              -{Math.round((1 - product.priceNew / product.priceOld) * 100)}%
                            </span>
                          )}
                        </div>
                        <div className="product-actions">
                          <button 
                            className={`action-btn ${wishlistItems.includes(product.id) ? 'active' : ''}`}
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleWishlistToggle(product); 
                            }}
                            title={wishlistItems.includes(product.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                          >
                            <FaHeart />
                          </button>
                          <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleProductClick(product.slug); }}>
                            <FaEye />
                          </button>
                        </div>
                      </div>
                      <div className="product-content">
                        <h3 className="product-name" onClick={() => handleProductClick(product.slug)}>
                          {product.title}
                        </h3>
                        <p className="product-description">{product.description}</p>
                        <div className="product-price">
                          {product.priceOld && product.priceNew && product.priceOld > product.priceNew ? (
                            <>
                              <span className="current-price">
                                {formatPrice(product.priceNew)}
                              </span>
                              <span className="original-price">
                                {formatPrice(product.priceOld)}
                              </span>
                            </>
                          ) : (
                            <span className="current-price">
                              {formatPrice(product.priceNew || product.priceOld)}
                            </span>
                          )}
                        </div>
                        <button
                          className="btn btn-primary btn-sm add-to-cart"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.quantity === 0}
                        >
                          <FaShoppingCart />
                          {product.quantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {products.length === 0 && (
                  <div className="no-products">
                    <i className="fas fa-search"></i>
                    <h3>Không tìm thấy sản phẩm</h3>
                    <p>Vui lòng thử lại với từ khóa khác</p>
                  </div>
                )}

                {totalPages > 1 && (
                  <>
                    {console.log('Rendering pagination - totalPages:', totalPages, 'currentPage:', currentPage)}
                    {renderPagination()}
                  </>
                )}
                {totalPages <= 1 && console.log('No pagination - totalPages:', totalPages)}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
