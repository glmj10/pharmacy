import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateCartItem, removeFromCart, clearCart, loading, updateCartItemStatus, updateAllCartItemsStatus, fetchCart } = useCart();
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState([]);
  useEffect(() => {
    // Sync selectedItems with backend selection status
    setSelectedItems(safeCartItems.filter(item => item.selected).map(item => item.id));
  }, [items]);

  // Safe fallback for cartItems
  const safeCartItems = items || [];

  // Không cần useEffect để mở modal nữa vì logic đã được xử lý ở Navbar

  const handleSelectItem = (itemId) => {
    const item = safeCartItems.find(i => i.id === itemId);
    const newSelected = !item.selected;
    updateCartItemStatus(itemId, newSelected)
      .then(() => {
        fetchCart();
      })
      .catch((error) => {
        console.error('Error updating item selected status:', error);
      });
  };

  const handleSelectAll = () => {
    const allSelected = safeCartItems.length > 0 && safeCartItems.every(item => item.selected);
    updateAllCartItemsStatus(!allSelected)
      .then(() => {
        fetchCart();
      })
      .catch((error) => {
        console.error('Error updating all items selected status:', error);
      });
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, newQuantity);
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) return;
    try {
      await Promise.all(selectedItems.map(itemId => removeFromCart(itemId)));
      fetchCart();
    } catch (error) {
      console.error('Error removing selected items:', error);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
      try {
        await clearCart();
        fetchCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const calculateSelectedTotal = () => {
    return safeCartItems
      .filter(item => item.selected)
      .reduce((total, item) => {
        const price = item.priceAtAddition !== undefined
          ? item.priceAtAddition
          : item.product.priceNew;
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
    
    const selectedProducts = safeCartItems.filter(item => selectedItems.includes(item.id));
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
          <p>{safeCartItems.length} sản phẩm</p>
        </div>

        {safeCartItems.length === 0 ? (
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
                    checked={selectedItems.length === safeCartItems.length && safeCartItems.length > 0}
                    onChange={handleSelectAll}
                  />
                  <span>Chọn tất cả ({safeCartItems.length})</span>
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
                {safeCartItems.map(item => (
                  <div key={item.id} className={`cart-item${item.isOutOfStock ? ' out-of-stock' : ''}`}>
                    <div className="item-select">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => handleSelectItem(item.id)}
                        disabled={item.isOutOfStock}
                      />
                    </div>

                    <div className="item-image">
                      <img
                        src={item.product.thumbnailUrl || '/api/placeholder/100/100'}
                        alt={item.product.title}
                        onClick={() => navigate(`/products/${item.product.id}`)}
                        onError={(e) => {
                          e.target.src = '/api/placeholder/100/100';
                        }}
                      />
                    </div>

                    <div className="item-info">
                      <h3 onClick={() => navigate(`/products/${item.product.id}`)}>
                        {item.product.title}
                      </h3>
                      <p className="item-category">{item.product.type}</p>
                      <div className="item-price">
                        <span className="original-price">
                          {formatPrice(item.priceAtAddition ?? item.product.priceOld)}
                        </span>
                        <span className="current-price">
                          {formatPrice(item.product.priceNew)}
                        </span>
                        {item.priceDifferent !== 0 && (
                          <span className="price-different">
                            {item.priceChangeType === 'INCREASE' ? '+' : '-'}{formatPrice(Math.abs(item.priceDifferent))}
                          </span>
                        )}
                      </div>
                      {item.isOutOfStock && (
                        <div className="out-of-stock-label">Hết hàng</div>
                      )}
                    </div>

                    <div className="item-quantity">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || item.isOutOfStock}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.quantity || item.isOutOfStock}
                      >
                        +
                      </button>
                    </div>

                    <div className="item-total">
                      {formatPrice((item.priceAtAddition ?? item.product.priceNew) * item.quantity)}
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
