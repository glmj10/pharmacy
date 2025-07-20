import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { useCart } from '../../contexts/CartContext';
import { categoryService } from '../../services/categoryService';
import { modalEvents } from '../../utils/modalEvents';
import CartModal from '../CartModal/CartModal';
import ModalNotification from '../NotificationModal/NotificationModal';
import {
  FaShoppingCart,
  FaHeart,
  FaUser,
  FaSearch,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaClipboardList,
  FaUserCircle,
  FaBell,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaChevronRight,
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { openLoginModal, openRegisterModal } = useAuthModal();
  const { getCartItemCount } = useCart();
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState([]); // All categories with nested children
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCount = async () => {
      const count = await getCartItemCount();
      if (isMounted) setCartCount(count);
    };
    fetchCount();
    return () => { isMounted = false; };
  }, [getCartItemCount, isAuthenticated, isCartModalOpen]);
  const navigate = useNavigate();
  const location = useLocation();

  
  // State to track hovered category for sub-dropdown
  const [hoveredCategory, setHoveredCategory] = useState(null); // Stores the category object being hovered

  const categoryDropdownRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoryService.getAllCategories();
        if (response?.data && Array.isArray(response.data)) {
          const processedCategories = response.data.map(cat => ({
            ...cat,
            children: cat.children || [] // Ensure children array exists
          }));
          setCategories(processedCategories);
        } else {
          console.warn('Unexpected categories response structure:', response);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories for navbar:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
        setHoveredCategory(null); // Close sub-dropdown too
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryDropdownOpen]);

  // Close menus when location (URL) changes
  useEffect(() => {
    const closeAllMenus = () => {
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
      setIsCategoryDropdownOpen(false);
      setHoveredCategory(null); // Ensure sub-dropdown is also closed
    };
    closeAllMenus();
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setTimeout(() => {
        navigate(`/products?title=${encodeURIComponent(searchQuery)}`);
        setIsSearching(false);
      }, 500);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const toggleCategoryDropdown = () => setIsCategoryDropdownOpen(prev => {
    if (prev) setHoveredCategory(null);
    return !prev;
  });

  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      if (e) e.preventDefault();
      modalEvents.requireLogin(() => {
        navigate('/cart');
      }, 'Bạn cần đăng nhập để xem giỏ hàng.');
      return false;
    }
    return true;
  };

  const handleWishlistClick = (e) => {
    if (!isAuthenticated) {
      if (e) e.preventDefault();
      modalEvents.requireLogin(() => {
        navigate('/wishlist');
      }, 'Bạn cần đăng nhập để xem danh sách yêu thích.');
      return false;
    }
    return true;
  };

  const handleNotificationClick = (e) => {
    e.preventDefault();
    setIsNotificationModalOpen(true);
  };

  // Handlers for main category items in dropdown
  const handleMainCategoryMouseEnter = (category) => {
    setHoveredCategory(category);
  };

  // Removed handleMainCategoryMouseLeave function completely as it's no longer needed on individual links.

  // Helper to construct category link based on type and close dropdown
  const getCategoryLinkAndClose = useCallback((category) => {
    let to = '/products?category=' + category.slug;
    if (category.type === 'BLOG') {
      to = '/blog?category=' + category.slug;
    }
    return {
      to,
      onClick: () => {
        setIsCategoryDropdownOpen(false);
        setHoveredCategory(null);
      }
    };
  }, []);

  return (
    <nav className="navbar">
      {/* Top Bar */}
      <div className="navbar-top">
        <div className="container">
          <div className="navbar-top-content">
            <div className="top-left">
              <div className="promotion-text">
                <span>Giảm đau</span>
                <span>Setsun trị gãu</span>
                <span>Bột sữi tư Pháp</span>
                <span>Khẩu trang</span>
                <span>Trị ngứa dai dẳng</span>
                <span>Trị viêm tiết bã</span>
              </div>
            </div>
            <div className="top-right">
              <div className="location-info">
                <FaMapMarkerAlt />
                <span>Hà Nội</span>
              </div>
              <div className="phone-info">
                <FaPhoneAlt />
                <span>1800 6821</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="navbar-main">
        <div className="container">
          <div className="navbar-content">
            <Link to="/" className="navbar-logo">
              <div className="logo-icon">
                <span className="logo-cross">⚕</span>
              </div>
              <div className="logo-text">
                <span className="logo-name">NHÀ THUỐC</span>
                <span className="logo-brand">Pharmacy</span>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="navbar-search">
              <form onSubmit={handleSearch} className={`search-form ${isSearching ? 'searching' : ''}`}>
                <input
                  type="text"
                  placeholder="Bạn đang tìm gì hôm nay..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  disabled={isSearching}
                />
                <button type="submit" className={`search-btn ${isSearching ? 'loading' : ''}`} disabled={isSearching}>
                  <FaSearch />
                </button>
              </form>
            </div>

            {/* Right Icons */}
            <div className="navbar-icons">
              <button onClick={handleNotificationClick} className="icon-link">
                <FaBell />
                <span className="notification-badge">2</span>
              </button>

              {isAuthenticated ? (
                <>
                  <Link to="/wishlist" className="icon-link" onClick={handleWishlistClick}>
                    <FaHeart />
                  </Link>

                  <button onClick={() => setIsCartModalOpen(true)} className="icon-link cart-link">
                    <FaShoppingCart />
                    {cartCount > 0 && (
                      <span className="cart-badge">{cartCount}</span>
                    )}
                  </button>

                  <div className="user-menu">
                    <button onClick={toggleUserMenu} className="user-menu-btn-main">
                      <FaUserCircle />
                      <span className="user-name">{user?.fullName || 'Tài khoản'}</span>
                    </button>
                    {isUserMenuOpen && (
                      <div className="user-menu-dropdown">
                        <Link to="/profile" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                          <FaUser />
                          Thông tin cá nhân
                        </Link>
                        <Link to="/orders" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                          <FaClipboardList />
                          Đơn hàng của tôi
                        </Link>
                        <button onClick={handleLogout} className="dropdown-item logout-btn">
                          <FaSignOutAlt />
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button onClick={handleCartClick} className="icon-link cart-link">
                    <FaShoppingCart />
                    {cartCount > 0 && (
                      <span className="cart-badge">{cartCount}</span>
                    )}
                  </button>

                  <div className="auth-section-main">
                    <button onClick={openLoginModal} className="auth-btn-main">Đăng nhập</button>
                    <button onClick={openRegisterModal} className="auth-btn-main register">Đăng ký</button>
                  </div>
                </>
              )}
            </div>

            <button className="mobile-menu-btn" onClick={toggleMenu}>
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      <div className="navbar-categories">
        <div className="container">
          <div className="categories-content">
            <div className="category-menu" ref={categoryDropdownRef}>
              <button className="category-btn" onClick={toggleCategoryDropdown}>
                <FaBars />
                <span>Danh mục</span>
                <FaChevronRight className={`dropdown-arrow ${isCategoryDropdownOpen ? 'rotated' : ''}`} /> 
              </button>
              {isCategoryDropdownOpen && (
                <div className="category-dropdown-content" onMouseLeave={() => setHoveredCategory(null)}>
                  <div className="main-category-list">
                    {categoriesLoading ? (
                      <div className="dropdown-loading">Đang tải danh mục...</div>
                    ) : (
                    categories.map((category) => (
                      <Link
                        key={category.id}
                        {...getCategoryLinkAndClose(category)}
                        className={`dropdown-item ${hoveredCategory?.id === category.id ? 'active' : ''}`}
                        onMouseEnter={() => handleMainCategoryMouseEnter(category)}
                      >
                        <img
                          src={category.thumbnail || '/api/placeholder/40/40'}
                          alt={category.name}
                          className="category-thumbnail-img"
                          onError={(e) => { e.target.src = '/api/placeholder/40/40'; }}
                        />
                        <span>{category.name}</span>
                        {category.children && category.children.length > 0 && <FaChevronRight className="dropdown-arrow-static" />}
                      </Link>
                    ))
                    )}
                  </div>
                  {hoveredCategory && hoveredCategory.children && hoveredCategory.children.length > 0 ? (
                    <div className="sub-category-list">
                      <h4>{hoveredCategory.name}</h4>
                      <div className="sub-category-items-grid">
                        {hoveredCategory.children.map((subCategory) => (
                          <Link
                            key={subCategory.id}
                            {...getCategoryLinkAndClose(subCategory)}
                            className="sub-dropdown-item"
                          >
                            <img
                              src={subCategory.thumbnail || '/api/placeholder/40/40'}
                              alt={subCategory.name}
                              className="category-thumbnail-img"
                              onError={(e) => { e.target.src = '/api/placeholder/40/40'; }}
                            />
                            <span>{subCategory.name}</span>
                          </Link>
                        ))}
                      </div>
                      <Link
                        {...getCategoryLinkAndClose(hoveredCategory)}
                        className="view-all-sub-categories-link"
                      >
                        Xem tất cả {hoveredCategory.name}
                      </Link>
                    </div>
                  ) : ( 
                    <div className="sub-category-list no-sub-categories">
                      <h4>{hoveredCategory ? hoveredCategory.name : 'Vui lòng chọn danh mục'}</h4>
                      <p>Không có danh mục con.</p>
                      {hoveredCategory && ( // Only show "Xem tất cả" if a category is actually hovered
                        <Link
                          {...getCategoryLinkAndClose(hoveredCategory)}
                          className="view-all-sub-categories-link"
                        >
                          Xem tất cả {hoveredCategory.name}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* These are the regular category links, showing a sliced subset */}
            <div className="category-links">
              {categoriesLoading ? (
                <div className="categories-loading">Đang tải...</div>
              ) : (
                categories.slice(0, 5).map((category) => (
                  <Link key={category.id} to={`/products?category=${category.slug}`} className="category-link">
                    {category.name}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-search">
            <form onSubmit={handleSearch} className={`search-form ${isSearching ? 'searching' : ''}`}>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                disabled={isSearching}
              />
              <button type="submit" className={`search-btn ${isSearching ? 'loading' : ''}`} disabled={isSearching}>
                <FaSearch />
              </button>
            </form>
          </div>

          <div className="mobile-nav">
            <div className="mobile-categories">
              <h4>Danh mục sản phẩm</h4>
              {categoriesLoading ? (
                <div className="categories-loading">Đang tải...</div>
              ) : (
                categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.slug}`}
                    className="mobile-nav-link category-mobile"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))
              )}
            </div>

            <Link to="/products" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Tất cả sản phẩm
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/wishlist" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  <FaHeart />
                  Yêu thích
                </Link>
                <Link to="/cart" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  <FaShoppingCart />
                  Giỏ hàng
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>
                <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  <FaUser />
                  Thông tin cá nhân
                </Link>
                <Link to="/orders" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  <FaClipboardList />
                  Đơn hàng của tôi
                </Link>
                <button onClick={handleLogout} className="mobile-nav-link logout-btn">
                  <FaSignOutAlt />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    openLoginModal();
                    setIsMenuOpen(false);
                  }}
                  className="mobile-nav-link"
                >
                  <FaShoppingCart />
                  Giỏ hàng
                </button>
                <button onClick={() => { openLoginModal(); setIsMenuOpen(false); }} className="mobile-nav-link auth-btn">
                  Đăng nhập
                </button>
                <button onClick={() => { openRegisterModal(); setIsMenuOpen(false); }} className="mobile-nav-link auth-btn">
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <CartModal isOpen={isCartModalOpen} onClose={() => setIsCartModalOpen(false)} />
      <ModalNotification isOpen={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)} />
    </nav>
  );
};

export default Navbar;