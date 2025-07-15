import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { useCart } from '../../contexts/CartContext';
import { categoryService } from '../../services/categoryService';
import { modalEvents } from '../../utils/modalEvents';
import CartModal from '../CartModal/CartModal';
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
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { openLoginModal, openRegisterModal } = useAuthModal();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoryService.getAllCategories();
        
        // Handle ApiResponse<List<CategoryResponse>> structure
        // Backend returns { status, message, data: List<CategoryResponse> }
        if (response?.data?.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        } else if (response?.data && Array.isArray(response.data)) {
          // Fallback for direct array response
          setCategories(response.data);
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

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      // Add a small delay to show the loading animation
      setTimeout(() => {
        navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        setIsSearching(false);
      }, 500);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      if (e) e.preventDefault(); // Ngăn điều hướng nếu có event
      modalEvents.requireLogin(() => {
        navigate('/cart');
      }, 'Bạn cần đăng nhập để xem giỏ hàng.');
      return false;
    }
    // Nếu đã đăng nhập, cho phép điều hướng
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

      {/* Main Header */}
      <div className="navbar-main">
        <div className="container">
          <div className="navbar-content">
            {/* Logo */}
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
              <Link to="/notifications" className="icon-link">
                <FaBell />
                <span className="notification-badge">2</span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/wishlist" className="icon-link">
                    <FaHeart />
                  </Link>
                  
                  <button 
                    onClick={() => setIsCartModalOpen(true)} 
                    className="icon-link cart-link"
                  >
                    <FaShoppingCart />
                    {getCartItemCount() > 0 && (
                      <span className="cart-badge">{getCartItemCount()}</span>
                    )}
                  </button>

                  <div className="user-menu">
                    <button 
                      onClick={toggleUserMenu}
                      className="user-menu-btn-main"
                    >
                      <FaUserCircle />
                      <span className="user-name">{user?.fullName || 'Tài khoản'}</span>
                    </button>
                    
                    {isUserMenuOpen && (
                      <div className="user-menu-dropdown">
                        <Link 
                          to="/profile" 
                          className="dropdown-item"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaUser />
                          Thông tin cá nhân
                        </Link>
                        <Link 
                          to="/orders" 
                          className="dropdown-item"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaClipboardList />
                          Đơn hàng của tôi
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="dropdown-item logout-btn"
                        >
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
                    {getCartItemCount() > 0 && (
                      <span className="cart-badge">{getCartItemCount()}</span>
                    )}
                  </button>

                  <div className="auth-section-main">
                    <button onClick={openLoginModal} className="auth-btn-main">
                      Đăng nhập
                    </button>
                    <button onClick={openRegisterModal} className="auth-btn-main register">
                      Đăng ký
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Categories Menu */}
      <div className="navbar-categories">
        <div className="container">
          <div className="categories-content">
            <div className="category-menu">
              <button className="category-btn">
                <FaBars />
                <span>Danh mục</span>
              </button>
            </div>
            <div className="category-links">
              {categoriesLoading ? (
                <div className="categories-loading">Đang tải...</div>
              ) : (
                categories.slice(0, 5).map((category) => (
                  <Link 
                    key={category.id} 
                    to={`/products?category=${category.slug}`} 
                    className="category-link"
                  >
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
            {/* Categories in mobile */}
            <div className="mobile-categories">
              <h4>Danh mục sản phẩm</h4>
              {categoriesLoading ? (
                <div className="categories-loading">Đang tải...</div>
              ) : (
                categories.slice(0, 5).map((category) => (
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
            
            <Link 
              to="/products" 
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Tất cả sản phẩm
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/wishlist" 
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaHeart />
                  Yêu thích
                </Link>
                
                <Link 
                  to="/cart" 
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaShoppingCart />
                  Giỏ hàng
                  {getCartItemCount() > 0 && (
                    <span className="cart-badge">{getCartItemCount()}</span>
                  )}
                </Link>

                <Link 
                  to="/profile" 
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUser />
                  Thông tin cá nhân
                </Link>

                <Link 
                  to="/orders" 
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaClipboardList />
                  Đơn hàng của tôi
                </Link>

                <button 
                  onClick={handleLogout}
                  className="mobile-nav-link logout-btn"
                >
                  <FaSignOutAlt />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate('/cart');
                    } else {
                      openLoginModal(() => {
                        navigate('/cart');
                      });
                    }
                    setIsMenuOpen(false);
                  }}
                  className="mobile-nav-link"
                >
                  <FaShoppingCart />
                  Giỏ hàng
                  {getCartItemCount() > 0 && (
                    <span className="cart-badge">{getCartItemCount()}</span>
                  )}
                </button>
                
                <button 
                  onClick={() => {
                    openLoginModal();
                    setIsMenuOpen(false);
                  }}
                  className="mobile-nav-link auth-btn"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => {
                    openRegisterModal();
                    setIsMenuOpen(false);
                  }}
                  className="mobile-nav-link auth-btn"
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cart Modal */}
      <CartModal 
        isOpen={isCartModalOpen} 
        onClose={() => setIsCartModalOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;
