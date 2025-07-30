import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom'; 
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import brandService from '../../services/brandService';
import { FaChevronRight, FaHome } from 'react-icons/fa'; 
import './Products.css';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import ProductCard from '../../components/ProductCard/ProductCard';
import useProductInteractions from '../../hooks/useProductInteractions'; 

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
  const [categories, setCategories] = useState([]);
  const [categoriesToDisplayInGrid, setCategoriesToDisplayInGrid] = useState([]);
  const [childCategoriesForBreadcrumb, setChildCategoriesForBreadcrumb] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;

  const {
    wishlistItems,
    handleProductClick,
    handleAddToCart,
    handleWishlistToggle,
    fetchWishlist 
  } = useProductInteractions();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getAllCategories();
      let fetchedCategories = [];
      if (response?.data && Array.isArray(response.data)) {
        fetchedCategories = response.data.map(cat => ({
          ...cat,
          children: cat.children || []
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

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    if (categories.length === 0) {
      return;
    }

    const manageCategoryDisplay = async () => {
      const currentSelectedCategorySlug = filters.category;

      if (!currentSelectedCategorySlug) {
        setCategoriesToDisplayInGrid(categories.slice(0, 8));
        setChildCategoriesForBreadcrumb([]);
        return;
      }

      let selectedCategoryObject = categories.find(cat => cat.slug === currentSelectedCategorySlug);
      let isTopLevelCategory = !!selectedCategoryObject;

      if (!selectedCategoryObject) {
        for (const parentCat of categories) {
          const child = (parentCat.children || []).find(c => c.slug === currentSelectedCategorySlug);
          if (child) {
            selectedCategoryObject = { ...child, parentId: parentCat.id };
            isTopLevelCategory = false;
            break;
          }
        }
      }

      if (!selectedCategoryObject) {
        console.warn(`Category slug "${currentSelectedCategorySlug}" not found.`);
        setCategoriesToDisplayInGrid([]);
        setChildCategoriesForBreadcrumb([]);
        return;
      }

      if (selectedCategoryObject.children && selectedCategoryObject.children.length > 0) {
        const children = await fetchChildrenFromApi(selectedCategoryObject.slug);
        setCategoriesToDisplayInGrid(children);
        setChildCategoriesForBreadcrumb(children);
      } else {
        setCategoriesToDisplayInGrid([]);
        if (!isTopLevelCategory && selectedCategoryObject.parentId) {
          const parentOfSelectedChild = categories.find(p => p.id === selectedCategoryObject.parentId);
          if (parentOfSelectedChild) {
            const siblings = await fetchChildrenFromApi(parentOfSelectedChild.slug);
            setChildCategoriesForBreadcrumb(siblings);
          } else {
            setChildCategoriesForBreadcrumb([]);
          }
        } else {
          setChildCategoriesForBreadcrumb([selectedCategoryObject]);
        }
      }
    };

    manageCategoryDisplay();

  }, [filters.category, categories, fetchChildrenFromApi]);


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

  const breadcrumbItems = useMemo(() => {
    const items = [
      { label: 'Trang chủ', path: '/', icon: <FaHome /> },
      { label: 'Sản phẩm', path: '/products' },
    ];

    const currentCategorySlugInMemo = filters.category;

    if (currentCategorySlugInMemo) {
      let foundCategory = null;
      let parentCategory = null;

      foundCategory = categories.find(cat => cat.slug === currentCategorySlugInMemo);

      if (!foundCategory) {
        for (const topCat of categories) {
          const child = (topCat.children || []).find(c => c.slug === currentCategorySlugInMemo);
          if (child) {
            foundCategory = child;
            parentCategory = topCat;
            break;
          }
        }
      }

      if (foundCategory) {
        if (parentCategory) {
          items.push({ label: parentCategory.name, path: `/products?category=${parentCategory.slug}` });
        }
        items.push({ label: foundCategory.name, path: `/products?category=${foundCategory.slug}` });
      }
    }
    return items;
  }, [filters.category, categories]);

  return (
    <div className="products-page">
      <div className="container">
        <Breadcrumb items={breadcrumbItems} />

        {categoriesToDisplayInGrid.length > 0 && (
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
                      let newCategorySlug = '';
                      if (category.parentId) {
                        const parent = categories.find(p => p.id === category.parentId);
                        if (parent) {
                          newCategorySlug = parent.slug;
                        } else {
                          console.warn(`Deselecting child category: ${category.name}, but parent not found. Resetting filter to all products.`);
                        }
                      } else {
                        console.log(`Deselecting top-level category: ${category.name}. Going back to all products.`);
                      }
                      handleFilterChange('category', newCategorySlug);

                    } else {
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
                    <ProductCard
                      key={product.id}
                      product={product}
                      formatPrice={formatPrice}
                      onAddToCart={handleAddToCart}
                      onWishlistToggle={handleWishlistToggle}
                      onProductClick={handleProductClick}
                      isWishlisted={wishlistItems.includes(product.id)}
                    />
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;