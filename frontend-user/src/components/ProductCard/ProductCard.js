import { FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa';
import './ProductCard.css'
import { useState } from 'react';
// ...existing code...

const ProductCard = ({ product, formatPrice, onAddToCart, onWishlistToggle, onProductClick }) => {
  const [localWishlist, setLocalWishlist] = useState(product.inWishlist);
  const [localLikes, setLocalLikes] = useState(product.numberOfLikes || 0);
  if (!product) {
    return null;
  }

  function formatLikes(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'k';
    }
    return num;
  }

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    setLocalWishlist((prev) => {
      const next = !prev;
      setLocalLikes(likes => next ? likes + 1 : likes - 1);
      return next;
    });
    onWishlistToggle(product);
  };

  return (
    <div className="product-card">
      <div className="product-image" onClick={() => onProductClick(product.slug)}>
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
            className={`action-btn ${localWishlist ? 'active' : ''}`}
            onClick={handleWishlistClick}
            title={localWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
          >
            <FaHeart />
          </button>
          <button
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onProductClick(product.slug);
            }}
          >
            <FaEye />
          </button>
        </div>
      </div>
      <div className="product-content">
        <h3 className="product-name" onClick={() => onProductClick(product.slug)}>
          {product.title}
        </h3>
        <div className="product-price">
          <span className="current-price">
            {product.priceOld && product.priceNew && product.priceOld > product.priceNew
              ? formatPrice(product.priceNew)
              : formatPrice(product.priceNew || product.priceOld)}
          </span>
          <span
            className="original-price"
            style={{ visibility: product.priceOld && product.priceNew && product.priceOld > product.priceNew ? 'visible' : 'hidden' }}
          >
            {formatPrice(product.priceOld)}
          </span>
        </div>
        {typeof product.numberOfLikes === 'number' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0.5rem 0', justifyContent: 'flex-start' }}>
            <FaHeart style={{ color: '#e74c3c', fontSize: '1em' }} />
            <span className="product-likes-count">{formatLikes(localLikes)}</span>
          </div>
        )}
        <button
          className="btn btn-primary btn-sm add-to-cart"
          onClick={() => onAddToCart(product)}
          disabled={product.quantity === 0}
        >
          <FaShoppingCart />
          {product.quantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;