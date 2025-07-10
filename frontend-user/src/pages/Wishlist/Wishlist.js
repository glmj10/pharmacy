import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { wishlistService } from '../../services/wishlistService';
import { toast } from 'react-toastify';
import './Wishlist.css';

const Wishlist = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await wishlistService.getWishlist();
      setWishlist(data);
    } catch (error) {
      toast.error('Không thể tải danh sách yêu thích: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(item => item.product.id !== productId));
      toast.success('Đã xóa khỏi danh sách yêu thích!');
    } catch (error) {
      toast.error('Không thể xóa sản phẩm: ' + error.message);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      toast.success('Đã thêm vào giỏ hàng!');
    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng: ' + error.message);
    }
  };

  const handleAddAllToCart = async () => {
    try {
      for (const item of wishlist) {
        await addToCart(item.product, 1);
      }
      toast.success('Đã thêm tất cả sản phẩm vào giỏ hàng!');
    } catch (error) {
      toast.error('Không thể thêm tất cả sản phẩm vào giỏ hàng: ' + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="wishlist-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách yêu thích...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h1>Danh sách yêu thích</h1>
        <p>Các sản phẩm bạn quan tâm</p>
        {wishlist.length > 0 && (
          <div className="wishlist-stats">
            <span>{wishlist.length} sản phẩm</span>
            <button onClick={handleAddAllToCart} className="add-all-btn">
              Thêm tất cả vào giỏ hàng
            </button>
          </div>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <div className="empty-icon">💝</div>
          <h3>Danh sách yêu thích trống</h3>
          <p>Bạn chưa có sản phẩm nào trong danh sách yêu thích.</p>
          <p>Hãy khám phá và thêm các sản phẩm bạn quan tâm!</p>
          <Link to="/products" className="shop-btn">
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map(item => (
            <div key={item.id} className="wishlist-item">
              <div className="item-image-container">
                <img
                  src={item.product.imageUrl || '/api/placeholder/200/200'}
                  alt={item.product.name}
                  className="item-image"
                />
                <button
                  onClick={() => handleRemoveFromWishlist(item.product.id)}
                  className="remove-btn"
                  title="Xóa khỏi danh sách yêu thích"
                >
                  ×
                </button>
                {item.product.discount && (
                  <div className="discount-badge">
                    -{item.product.discount}%
                  </div>
                )}
              </div>
              
              <div className="item-details">
                <Link to={`/products/${item.product.id}`} className="item-title">
                  {item.product.name}
                </Link>
                <p className="item-category">{item.product.category}</p>
                <p className="item-description">{item.product.description}</p>
                
                <div className="item-price">
                  {item.product.discount ? (
                    <>
                      <span className="discounted-price">
                        {formatCurrency(item.product.price * (1 - item.product.discount / 100))}
                      </span>
                      <span className="original-price">
                        {formatCurrency(item.product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="current-price">
                      {formatCurrency(item.product.price)}
                    </span>
                  )}
                </div>

                <div className="item-actions">
                  <button
                    onClick={() => handleAddToCart(item.product)}
                    className="add-to-cart-btn"
                    disabled={!item.product.inStock}
                  >
                    {item.product.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
                  </button>
                  <Link to={`/products/${item.product.id}`} className="view-btn">
                    Xem chi tiết
                  </Link>
                </div>

                <div className="item-meta">
                  <span className="added-date">
                    Thêm vào: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <div className="stock-status">
                    {item.product.inStock ? (
                      <span className="in-stock">Còn hàng</span>
                    ) : (
                      <span className="out-of-stock">Hết hàng</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {wishlist.length > 0 && (
        <div className="wishlist-footer">
          <div className="wishlist-summary">
            <h3>Tổng quan</h3>
            <p>Tổng cộng {wishlist.length} sản phẩm trong danh sách yêu thích</p>
            <p>
              Tổng giá trị: {formatCurrency(
                wishlist.reduce((total, item) => {
                  const price = item.product.discount 
                    ? item.product.price * (1 - item.product.discount / 100)
                    : item.product.price;
                  return total + price;
                }, 0)
              )}
            </p>
          </div>
          <div className="wishlist-actions">
            <button onClick={handleAddAllToCart} className="add-all-btn">
              Thêm tất cả vào giỏ hàng
            </button>
            <Link to="/products" className="continue-shopping-btn">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
