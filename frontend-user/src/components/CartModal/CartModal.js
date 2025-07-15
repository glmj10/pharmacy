import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { FaTimes, FaShoppingCart, FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import './CartModal.css';

const CartModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { items, updateCartItem, removeFromCart, clearCart, loading } = useCart();
  const { updateCartItemStatus, fetchCart } = useCart();
  const [selectedItems, setSelectedItems] = useState([]);
  const {updateAllCartItemsStatus} = useCart();

  const safeCartItems = items || [];
  const { totalPrice } = useCart();

  const hasFetchedCart = useRef(false);
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      if (!hasFetchedCart.current) {
        fetchCart();
        hasFetchedCart.current = true;
      }
    } else {
      hasFetchedCart.current = false;
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, fetchCart]);

  const handleSelectItem = (itemId) => {
    // Lấy trạng thái hiện tại của item từ safeCartItems
    const item = safeCartItems.find(i => i.id === itemId);
    const newSelected = !item.selected;
    // Gọi API để cập nhật trạng thái selected (true nếu tích xanh, false nếu bỏ tích)
    updateCartItemStatus(itemId, newSelected)
      .then(() => {
        fetchCart();
        setSelectedItems(prev =>
          newSelected
            ? [...prev, itemId]
            : prev.filter(id => id !== itemId)
        );
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
        setSelectedItems(!allSelected ? safeCartItems.filter(item => !item.isOutOfStock).map(item => item.id) : []);
      })
      .catch((error) => {
        console.error('Error updating all items selected status:', error);
      });
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, newQuantity);
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


  const calculateTotal = () => {
    return safeCartItems.reduce((total, item) => {
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
    onClose();
    navigate('/checkout', { state: { selectedItems: selectedProducts } });
  };

  const handleViewFullCart = () => {
    onClose();
    navigate('/cart');
  };

  if (!isOpen) return null;

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-modal-header">
          <div className="modal-title">
            <FaShoppingCart />
            <h2>Giỏ hàng của bạn</h2>
            <span className="item-count">({safeCartItems.length})</span>
          </div>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="cart-modal-content">
          {loading ? (
            <div className="cart-loading">
              <div className="spinner"></div>
              <p>Đang tải giỏ hàng...</p>
            </div>
          ) : safeCartItems.length === 0 ? (
            <div className="empty-cart">
              <FaShoppingCart className="empty-icon" />
              <h3>Giỏ hàng trống</h3>
              <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
              <button className="continue-shopping-btn" onClick={() => {
                onClose();
                navigate('/products');
              }}>
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <>
              {/* Cart Actions */}
              <div className="cart-actions">
                <div className="select-all">
                  <input
                    type="checkbox"
                    checked={safeCartItems.length > 0 && safeCartItems.every(item => item.selected)}
                    onChange={handleSelectAll}
                  />
                  <span>Chọn tất cả</span>
                </div>
                <div className="action-buttons">
                  {selectedItems.length > 0 && (
                    <button className="remove-selected-btn" onClick={handleRemoveSelected}>
                      <FaTrash /> Xóa đã chọn ({selectedItems.length})
                    </button>
                  )}
                  <button className="clear-cart-btn" onClick={handleClearCart}>
                    <FaTrash /> Xóa tất cả
                  </button>
                </div>
              </div>

              {/* Cart Items */}
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
                        src={item.product.thumbnailUrl || '/api/placeholder/60/60'}
                        alt={item.product.title}
                        onError={(e) => {
                          e.target.src = '/api/placeholder/60/60';
                        }}
                      />
                    </div>

                    <div className="item-details">
                      <h4 className="item-name">{item.product.title}</h4>
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

                      <div className="item-controls">
                        <div className="quantity-controls">
                          <button
                            className="qty-btn"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || item.isOutOfStock}
                          >
                            <FaMinus />
                          </button>
                          <input
                            type="number"
                            className="quantity-input"
                            min={1}
                            max={item.product.quantity}
                            value={item.quantity}
                            disabled={item.isOutOfStock}
                            onChange={e => {
                              const value = Number(e.target.value);
                              if (value >= 1 && value <= item.product.quantity) {
                                handleQuantityChange(item.id, value);
                              }
                            }}
                            style={{ width: '50px', textAlign: 'center' }}
                          />
                          <button
                            className="qty-btn"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.quantity || item.isOutOfStock}
                          >
                            <FaPlus />
                          </button>
                        </div>

                        <button
                          className="remove-item-btn"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Tổng cộng:</span>
                  <span className="total-price">{formatPrice(calculateTotal())}</span>
                </div>

                {selectedItems.length > 0 && (
                  <div className="summary-row selected">
                    <span>Đã chọn ({selectedItems.length}):</span>
                    <span className="selected-price">{formatPrice(totalPrice)}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="modal-actions">
                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                >
                  Thanh toán ({selectedItems.length})
                </button>

                <button
                  className="view-cart-btn"
                  onClick={handleViewFullCart}
                >
                  Xem giỏ hàng đầy đủ
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
