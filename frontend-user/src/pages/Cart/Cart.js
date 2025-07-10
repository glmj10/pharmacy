import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      await Promise.all(selectedItems.map(itemId => removeFromCart(itemId)));
      setSelectedItems([]);
    } catch (error) {
      console.error('Error removing selected items:', error);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
      try {
        await clearCart();
        setSelectedItems([]);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const calculateSelectedTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => {
        const price = item.product.discount > 0 
          ? item.product.price * (1 - item.product.discount / 100)
          : item.product.price;
        return total + (price * item.quantity);
      }, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }
    
    const selectedProducts = cartItems.filter(item => selectedItems.includes(item.id));
    navigate('/checkout', { state: { selectedItems: selectedProducts } });
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="spinner"></div>
        <p>Đang tải giỏ hàng...</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Giỏ hàng của bạn</h1>
          <p>{cartItems.length} sản phẩm</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <i className="fas fa-shopping-cart"></i>
            <h2>Giỏ hàng trống</h2>
            <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
            <button className="continue-shopping-btn" onClick={() => navigate('/products')}>
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {/* Cart Header */}
              <div className="cart-items-header">
                <div className="select-all">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === cartItems.length}
                    onChange={handleSelectAll}
                  />
                  <span>Chọn tất cả ({cartItems.length})</span>
                </div>
                <div className="cart-actions">
                  {selectedItems.length > 0 && (
                    <button className="remove-selected-btn" onClick={handleRemoveSelected}>
                      Xóa đã chọn ({selectedItems.length})
                    </button>
                  )}
                  <button className="clear-cart-btn" onClick={handleClearCart}>
                    Xóa tất cả
                  </button>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="cart-items-list">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-select">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                      />
                    </div>
                    
                    <div className="item-image">
                      <img
                        src={item.product.image || '/api/placeholder/100/100'}
                        alt={item.product.name}
                        onClick={() => navigate(`/products/${item.product.id}`)}
                        onError={(e) => {
                          e.target.src = '/api/placeholder/100/100';
                        }}
                      />
                    </div>
                    
                    <div className="item-info">
                      <h3 onClick={() => navigate(`/products/${item.product.id}`)}>
                        {item.product.name}
                      </h3>
                      <p className="item-category">{item.product.categoryName}</p>
                      <div className="item-price">
                        {item.product.discount > 0 ? (
                          <>
                            <span className="original-price">
                              {formatPrice(item.product.price)}
                            </span>
                            <span className="discounted-price">
                              {formatPrice(item.product.price * (1 - item.product.discount / 100))}
                            </span>
                          </>
                        ) : (
                          <span className="current-price">
                            {formatPrice(item.product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="item-quantity">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.quantity}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="item-total">
                      {formatPrice(
                        (item.product.discount > 0 
                          ? item.product.price * (1 - item.product.discount / 100)
                          : item.product.price
                        ) * item.quantity
                      )}
                    </div>
                    
                    <button
                      className="remove-item-btn"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="cart-summary">
              <h3>Tóm tắt đơn hàng</h3>
              
              <div className="summary-row">
                <span>Sản phẩm đã chọn:</span>
                <span>{selectedItems.length} sản phẩm</span>
              </div>
              
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{formatPrice(calculateSelectedTotal())}</span>
              </div>
              
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span className="free-shipping">Miễn phí</span>
              </div>
              
              <div className="summary-row total">
                <span>Tổng cộng:</span>
                <span>{formatPrice(calculateSelectedTotal())}</span>
              </div>
              
              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
              >
                Thanh toán ({selectedItems.length})
              </button>
              
              <button
                className="continue-shopping-btn"
                onClick={() => navigate('/products')}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
