import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { wishlistService } from '../../services/wishlistService';
import { toast } from 'react-toastify';
import './Wishlist.css';
import ProductCard from '../../components/ProductCard/ProductCard';

const Wishlist = () => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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
      const response = await wishlistService.getWishlist();
      const data = response.data;
      setWishlist(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(item => item.id !== productId));
      toast.success('Đã xóa khỏi danh sách yêu thích!');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      toast.success('Đã thêm vào giỏ hàng!');
    } catch (error) {
      console.error('Không thể thêm vào giỏ hàng: ' + error.message);
    }
  };

  const handleAddAllToCart = async () => {
    try {
      for (const item of wishlist) {
        await addToCart(item, 1);
      }
      toast.success('Đã thêm tất cả sản phẩm vào giỏ hàng!');
    } catch (error) {
      console.error('Không thể thêm tất cả sản phẩm vào giỏ hàng: ' + error.message);
    }
  };

  const handleClearWishlist = async () => {
    try {
      await wishlistService.clearWishlist();
      setWishlist([]);
      toast.success('Đã xóa toàn bộ danh sách yêu thích!');
    } catch (error) {
      console.error('Không thể xóa toàn bộ danh sách: ' + error.message);
    }
    setShowConfirmModal(false);
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
              <div style={{ position: 'relative' }}>
        <ProductCard
          product={{
            id: item.id,
            slug: item.slug || item.id,
            thumbnailUrl: item.thumbnailUrl || item.imageUrl,
            title: item.title || item.name,
            priceNew: typeof item.priceNew === 'number'
              ? item.priceNew
              : (typeof item.price === 'number' ? item.price : undefined),
            priceOld: typeof item.priceOld === 'number'
              ? item.priceOld
              : undefined,
            inWishlist: true,
            numberOfLikes: item.numberOfLikes,
            quantity: typeof item.quantity === 'number'
              ? item.quantity
              : (item.inStock ? 1 : 0),
          }}
          formatPrice={formatCurrency}
          onAddToCart={() => handleAddToCart(item)}
          onWishlistToggle={() => handleRemoveFromWishlist(item.id)}
          onProductClick={(slugOrId) => window.location.href = `/products/${item.slug || item.id}`}
        />
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
          </div>
          <div className="wishlist-actions">
            <button onClick={handleAddAllToCart} className="add-all-btn">
              Thêm tất cả vào giỏ hàng
            </button>
            <button onClick={() => setShowConfirmModal(true)} className="add-all-btn" style={{background: '#f44336', color: '#fff', minWidth: '160px'}}>
              Xóa tất cả
            </button>
            <Link to="/products" className="continue-shopping-btn">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      )}
    {/* Modal xác nhận xóa tất cả wishlist */}
    {showConfirmModal && (
      <div className="modal-overlay" style={{position: 'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.3)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div className="modal-content" style={{background:'#fff', borderRadius:'10px', padding:'2rem', minWidth:'320px', boxShadow:'0 2px 16px rgba(0,0,0,0.15)'}}>
          <h2 style={{marginBottom:'1rem', color:'#f44336'}}>Xác nhận xóa tất cả</h2>
          <p>Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi danh sách yêu thích?</p>
          <div style={{display:'flex', gap:'1rem', marginTop:'2rem', justifyContent:'flex-end'}}>
            <button className="add-all-btn" style={{background:'#f44336', color:'#fff', minWidth:'120px'}} onClick={handleClearWishlist}>Xóa tất cả</button>
            <button className="add-all-btn" style={{background:'#ccc', color:'#333', minWidth:'120px'}} onClick={()=>setShowConfirmModal(false)}>Hủy</button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default Wishlist;
