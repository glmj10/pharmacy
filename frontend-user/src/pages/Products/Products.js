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
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    title: searchParams.get('title') || '',
    priceFrom: searchParams.get('priceFrom') || '',
    priceTo: searchParams.get('priceTo') || '',
    isAscending: searchParams.get('isAscending') !== null ? searchParams.get('isAscending') === 'true' : null,
    brand: searchParams.get('brand') || '',
    category: searchParams.get('category') || ''
  });

  // Đồng bộ filters với searchParams khi URL thay đổi (ví dụ khi click từ Navbar hoặc refresh)
  useEffect(() => {
    setFilters({
      title: searchParams.get('title') || '',
      priceFrom: searchParams.get('priceFrom') || '',
      priceTo: searchParams.get('priceTo') || '',
      isAscending: searchParams.get('isAscending') !== null ? searchParams.get('isAscending') === 'true' : null,
      brand: searchParams.get('brand') || '',
      category: searchParams.get('category') || ''
    });
  }, [searchParams]);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Danh sách tất cả các danh mục cấp cao nhất với các con của chúng
  const [categoriesToDisplayInGrid, setCategoriesToDisplayInGrid] = useState([]); // Danh sách các danh mục HIỆN TẠI để hiển thị trong lưới
  const [childCategoriesForBreadcrumb, setChildCategoriesForBreadcrumb] = useState([]); // Danh sách các con của danh mục cha được chọn (dùng cho breadcrumb, không nhất thiết là cho grid)
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { executeWithAuth } = useAuthAction();

  const [wishlistItems, setWishlistItems] = useState([]);

  // Hàm này bây giờ sẽ chuẩn hóa cấu trúc category để luôn có `children` array
  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getAllCategories();
      let fetchedCategories = [];
      if (response?.data && Array.isArray(response.data)) {
        fetchedCategories = response.data.map(cat => ({
          ...cat,
          children: cat.children || [] // Đảm bảo mỗi category object có thuộc tính 'children'
        }));
      } else if (Array.isArray(response)) {
        fetchedCategories = response.map(cat => ({
          ...cat,
          children: cat.children || []
        }));
      } else {
        console.warn('Unexpected categories response structure:', response);
      }
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  }, []);

  // Hàm này chỉ còn phục vụ việc fetch children từ API, không trực tiếp set state hiển thị grid
  const fetchChildrenFromApi = useCallback(async (parentSlug) => {
    try {
      const response = await categoryService.getCategoriesByParentSlug(parentSlug);
      let children = [];
      if (response?.data && Array.isArray(response.data)) {
        children = response.data.flatMap(item => {
          const parentId = item.parent ? item.parent.id : null;
          return (item.children || []).map(child => ({
            ...child,
            parentId: parentId,
            children: child.children || []
          }));
        });
      } else if (Array.isArray(response)) {
        children = response.flatMap(item => {
          const parentId = item.parent ? item.parent.id : null;
          return (item.children || []).map(child => ({
            ...child,
            parentId: parentId,
            children: child.children || []
          }));
        });
      } else {
        console.warn('Unexpected child categories response structure:', response);
      }
      return children;
    } catch (error) {
      console.error('Error fetching child categories:', error);
      return [];
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const response = await brandService.getAllBrands();
      if (response?.data && Array.isArray(response.data)) {
        setBrands(response.data);
      } else if (Array.isArray(response)) {
        setBrands(response);
      } else {
        console.warn('Unexpected brands response structure:', response);
        setBrands([]);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        pageIndex: currentPage,
        pageSize: itemsPerPage,
        title: filters.title,
        priceFrom: filters.priceFrom ? parseInt(filters.priceFrom) : undefined,
        priceTo: filters.priceTo ? parseInt(filters.priceTo) : undefined,
        isAscending: filters.isAscending,
        brand: filters.brand,
        category: filters.category
      };

      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await productService.getAllProducts(params);

      let productsData;
      let totalPagesData;
      let totalElementsData;

      if (response && response.data && response.data.content) {
        productsData = response.data.content;
        totalPagesData = response.data.totalPages;
        totalElementsData = response.data.totalElements;
      } else if (response && response.content) {
        productsData = response.content;
        totalPagesData = response.totalPages;
        totalElementsData = response.totalElements;
      } else if (Array.isArray(response)) {
        productsData = response;
        totalPagesData = 1;
        totalElementsData = response.length;
      } else {
        console.warn('Unexpected products response structure:', response);
        productsData = [];
        totalPagesData = 1;
        totalElementsData = 0;
      }

      setProducts(productsData || []);
      setTotalItems(totalElementsData || 0);
      setTotalPages(totalPagesData || 1);
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

  // NEW useEffect to manage `categoriesToDisplayInGrid` and `childCategoriesForBreadcrumb`
  useEffect(() => {
    if (categories.length === 0) {
      return; // Đợi categories được load hoàn chỉnh
    }

    const manageCategoryDisplay = async () => {
      const currentSelectedCategorySlug = filters.category;

      if (!currentSelectedCategorySlug) {
        // Case 1: Không có danh mục nào được chọn (trạng thái ban đầu hoặc reset)
        setCategoriesToDisplayInGrid(categories.slice(0, 8)); // Hiển thị 8 danh mục cha đầu tiên
        setChildCategoriesForBreadcrumb([]); // Xóa danh mục con cho breadcrumb
        return;
      }

      // Tìm danh mục đang được chọn (có thể là cha hoặc con)
      let selectedCategoryObject = categories.find(cat => cat.slug === currentSelectedCategorySlug);
      let isTopLevelCategory = !!selectedCategoryObject;

      if (!selectedCategoryObject) { // Nếu không tìm thấy ở cấp cao nhất, tìm trong tất cả các danh mục con
        for (const parentCat of categories) {
          const foundChild = (parentCat.children || []).find(child => child.slug === currentSelectedCategorySlug);
          if (foundChild) {
            selectedCategoryObject = { ...foundChild, parentId: parentCat.id }; // Gắn parentId vào đây!
            isTopLevelCategory = false;
            break;
          }
        }
      }

      if (!selectedCategoryObject) {
        // Slug không hợp lệ hoặc danh mục không tồn tại
        setCategoriesToDisplayInGrid([]); // Ẩn grid
        setChildCategoriesForBreadcrumb([]);
        return;
      }

      // Quyết định những danh mục nào sẽ hiển thị trong lưới VÀ dữ liệu cho breadcrumb
      if (selectedCategoryObject.children && selectedCategoryObject.children.length > 0) {
        // Case A: Danh mục được chọn CÓ danh mục con
        // -> Hiển thị các con trực tiếp của nó trong grid
        const children = await fetchChildrenFromApi(selectedCategoryObject.slug);
        setCategoriesToDisplayInGrid(children);
        setChildCategoriesForBreadcrumb(children); // Cập nhật cho breadcrumb
      } else {
        // Case B: Danh mục được chọn KHÔNG CÓ danh mục con (là leaf node)
        // -> Ẩn grid theo yêu cầu mới
        setCategoriesToDisplayInGrid([]);

        // childCategoriesForBreadcrumb vẫn cần chứa các anh chị em của nó
        // nếu nó là một danh mục con để breadcrumb có thể hiển thị đường dẫn đầy đủ
        if (!isTopLevelCategory && selectedCategoryObject.parentId) {
          const parentOfSelectedChild = categories.find(p => p.id === selectedCategoryObject.parentId);
          if (parentOfSelectedChild) {
            const siblings = await fetchChildrenFromApi(parentOfSelectedChild.slug);
            setChildCategoriesForBreadcrumb(siblings); // Populate siblings for breadcrumb
          } else {
            setChildCategoriesForBreadcrumb([]);
          }
        } else {
          // Nếu là top-level leaf hoặc không có parentId (lỗi dữ liệu), chỉ set bản thân nó vào breadcrumb
          // hoặc clear nếu không muốn hiển thị sibling nào.
          // Ở đây, tôi sẽ set nó vào để breadcrumb vẫn hiển thị được item này nếu nó là leaf node top-level.
          setChildCategoriesForBreadcrumb([selectedCategoryObject]);
        }
      }
    };

    manageCategoryDisplay();

  }, [filters.category, categories, fetchChildrenFromApi]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleFilterChange = useCallback((keyOrObject, value) => {
    let newFilters;
    if (typeof keyOrObject === 'object' && keyOrObject !== null) {
      newFilters = { ...filters, ...keyOrObject };
    } else {
      newFilters = { ...filters, [keyOrObject]: value };
    }
    setFilters(newFilters);
    setCurrentPage(1);

    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        newParams.set(k, v);
      }
    });
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

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

  const getBreadcrumbPath = useCallback(() => {
    if (!filters.category) return [];

    const breadcrumbItems = [];

    // Tìm danh mục active hiện tại.
    // Đầu tiên tìm trong `categories` (cấp cao nhất)
    let currentActiveCategory = categories.find(cat => cat.slug === filters.category);

    // Nếu không tìm thấy ở cấp cao nhất, tìm trong `childCategoriesForBreadcrumb`
    // (Đây là nơi chứa danh mục đang được chọn nếu nó là con, cùng với các anh chị em của nó,
    // và đảm bảo có parentId)
    if (!currentActiveCategory) {
      currentActiveCategory = childCategoriesForBreadcrumb.find(cat => cat.slug === filters.category);
    }

    // Fallback: Nếu vẫn không tìm thấy, thử tìm lại từ tất cả các children của `categories`
    // (trong trường hợp `childCategoriesForBreadcrumb` chưa kịp cập nhật hoặc lỗi)
    if (!currentActiveCategory && categories.length > 0) {
      for (const parentCat of categories) {
        const foundChild = (parentCat.children || []).find(child => child.slug === filters.category);
        if (foundChild) {
          currentActiveCategory = { ...foundChild, parentId: parentCat.id }; // Đảm bảo parentId được thêm vào
          break;
        }
      }
    }

    if (currentActiveCategory) {
      // Nếu danh mục active có parentId (là danh mục con)
      if (currentActiveCategory.parentId) {
        const parent = categories.find(cat => cat.id === currentActiveCategory.parentId);
        if (parent) {
          breadcrumbItems.push({ name: parent.name, slug: parent.slug });
        } else {
          console.warn("[getBreadcrumbPath] Parent not found for child category:", currentActiveCategory.name);
        }
      }
      // Thêm danh mục active hiện tại
      breadcrumbItems.push({ name: currentActiveCategory.name, slug: currentActiveCategory.slug });
    } else {
      console.warn("[getBreadcrumbPath] No active category found for slug:", filters.category);
    }

    return breadcrumbItems;
  }, [filters.category, categories, childCategoriesForBreadcrumb]);

  const renderBreadcrumb = useCallback(() => {
    const breadcrumbPath = getBreadcrumbPath();
    return (
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-item">
          <FaHome />
          Trang chủ
        </Link>
        <FaChevronRight className="breadcrumb-separator" />
        <Link to="/products" className="breadcrumb-item" onClick={() => handleFilterChange('category', '')}>
          Sản phẩm
        </Link>
        {breadcrumbPath.map((item, idx) => (
          <React.Fragment key={idx}>
            <FaChevronRight className="breadcrumb-separator" />
            {idx === breadcrumbPath.length - 1 ? (
              <span className="breadcrumb-item active">{item.name}</span>
            ) : (
              <Link
                to={`/products?category=${item.slug}`}
                className="breadcrumb-item"
              >
                {item.name}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }, [getBreadcrumbPath, handleFilterChange]);

  return (
    <div className="products-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        {renderBreadcrumb()}

        {/* Categories Section */}

        {categoriesToDisplayInGrid.length > 0 && ( // MỚI: Điều kiện hiển thị lưới danh mục dựa trên categoriesToDisplayInGrid
          <div className="categories-section">
            <h2>Danh mục sản phẩm</h2>
            <div className="categories-grid">
              {categoriesToDisplayInGrid.map(category => (
                <div
                  key={category.id}
                  className={`category-card ${filters.category === category.slug ? 'active' : ''}`}
                  onClick={() => {
                    const isActive = filters.category === category.slug;

                    if (isActive) {
                      // Logic deselect: Quay về danh mục cha hoặc trang tất cả sản phẩm
                      let newCategorySlug = '';
                      if (category.parentId) { // Nếu là danh mục con (có parentId)
                        const parent = categories.find(p => p.id === category.parentId);
                        if (parent) {
                          newCategorySlug = parent.slug;
                        } else {
                          console.warn(`Deselecting child category: ${category.name}, but parent not found. Resetting filter to all products.`);
                        }
                      } else { // Nếu là danh mục cấp cao nhất (không có parentId)
                        // Hiện tại không có trường hợp này trong categoriesToDisplayInGrid,
                        // nhưng vẫn giữ để phòng hờ hoặc nếu logic thay đổi.
                        console.log(`Deselecting top-level category: ${category.name}. Going back to all products.`);
                      }
                      handleFilterChange('category', newCategorySlug);

                    } else {
                      // Logic select: Chọn danh mục mới
                      handleFilterChange('category', category.slug);
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

        )}

        <div className="products-content">
          {/* Filters Sidebar */}
          <div className="filters-sidebar">
            <div className="filter-section">
              <h3>Thiết lập lại</h3>
              <button
                className="apply-filters-btn"
                onClick={() => {
                  const currentCategory = filters.category;
                  setFilters({
                    title: '',
                    category: currentCategory,
                    brand: '',
                    priceFrom: '',
                    priceTo: '',
                    isAscending: null
                  });

                  const newParams = new URLSearchParams();
                  if (currentCategory) {
                    newParams.set('category', currentCategory);
                  }
                  setSearchParams(newParams);
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
                    handleFilterChange({ priceFrom: '0', priceTo: '100000' });
                  }}
                >
                  Dưới 100.000 ₫
                </button>
                <button
                  className={`price-range-btn ${filters.priceFrom === '100000' && filters.priceTo === '300000' ? 'active' : ''}`}
                  onClick={() => {
                    handleFilterChange({ priceFrom: '100000', priceTo: '300000' });
                  }}
                >
                  100.000 ₫ - 300.000 ₫
                </button>
                <button
                  className={`price-range-btn ${filters.priceFrom === '300000' && filters.priceTo === '500000' ? 'active' : ''}`}
                  onClick={() => {
                    handleFilterChange({ priceFrom: '300000', priceTo: '500000' });
                  }}
                >
                  300.000 ₫ - 500.000 ₫
                </button>
                <button
                  className={`price-range-btn ${filters.priceFrom === '500000' && filters.priceTo === '' ? 'active' : ''}`}
                  onClick={() => {
                    handleFilterChange({ priceFrom: '500000', priceTo: '' });
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
                  fetchProducts();
                }}
              >
                Áp dụng
              </button>
            </div>

            <div className="filter-section">
              <h3>Thương hiệu</h3>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
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