import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'; 
import { productService } from '../../services/productService';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthAction } from '../../hooks/useAuthAction';
import { wishlistService } from '../../services/wishlistService';
import { FaChevronRight, FaHome } from 'react-icons/fa'; // Vẫn cần import FaHome ở đây
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import './ProductDetail.css';
import './ProductDetailDescription.css'
import ProductCard from '../../components/ProductCard/ProductCard';

const ProductDetail = () => {
  // Slider state for related products
  const [relatedIndex, setRelatedIndex] = useState(0);
  const relatedVisible = 3; // Number of cards visible at once

  const handleRelatedPrev = () => {
    setRelatedIndex(prev => Math.max(prev - 1, 0));
  };
  const handleRelatedNext = () => {
    setRelatedIndex(prev => Math.min(prev + 1, Math.max(relatedProducts.length - relatedVisible, 0)));
  };
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showToggleDescription, setShowToggleDescription] = useState(false);
  const [noFade, setNoFade] = useState(false);
  const [autoSlide, setAutoSlide] = useState(false);
  const descriptionRef = useRef(null);
  const autoSlideRef = useRef(null);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const { executeWithAuth } = useAuthAction();

  const productImages = useMemo(() => {
    return product?.images && product.images.length > 0
      ? product.images.map(img => img.imageUrl)
      : [product?.thumbnailUrl || '/api/placeholder/400/400'];
  }, [product]);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productService.getProductBySlug(slug);
      let productData;
      if (response?.data) {
        productData = response.data;
      } else if (response) {
        productData = response;
      } else {
        throw new Error('Invalid product response');
      }

      setProduct(productData);
      setIsInWishlist(productData.inWishlist || false);
      
      const brandId = productData.brandId || productData.brand?.id;

      if (brandId) { 
        const relatedResponse = await productService.get15ProductByBrandId(brandId);
        let relatedData = [];
        if (relatedResponse?.data && Array.isArray(relatedResponse.data)) {
          relatedData = relatedResponse.data;
        } else if (Array.isArray(relatedResponse)) { 
          relatedData = relatedResponse;
        }
        console.log('Related products:', relatedData);

        setRelatedProducts(relatedData.filter(p => p.slug !== slug));
      }

    } catch (err) {
      setError('Không thể tải thông tin sản phẩm');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    setTimeout(() => {
      if (descriptionRef.current && product?.description) {
        const isOverflow = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight + 5;

        const isLongDescription = product.description.length > 100;

        const hasMultipleLines = product.description.split('\n').length > 1;

        const shouldShowToggle = isLongDescription || isOverflow || hasMultipleLines;

        setShowToggleDescription(shouldShowToggle);
        setNoFade(!isOverflow); 
      }
    }, 100); 
  }, [product?.description, showFullDescription]);

  const handleAddToCart = executeWithAuth(async (id = product?.id) => {
    try {
      await addToCart(id, quantity);
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  });

  const handleWishlistToggle = executeWithAuth(async (id = product?.id) => {
    try {
      if (id === product?.id) {
        if (isInWishlist) {
          await wishlistService.removeFromWishlist(id);
          setIsInWishlist(false);
        } else {
          await wishlistService.addToWishlist(id);
          setIsInWishlist(true);
        }
      } else {
        await wishlistService.addToWishlist(id);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  });

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.quantity) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const breadcrumbItems = useMemo(() => {
    if (location.state?.previousBreadcrumb && Array.isArray(location.state.previousBreadcrumb)) {
      const prevItems = location.state.previousBreadcrumb.map(item => {
        if (item.icon === 'home') {
          return { ...item, icon: <FaHome /> };
        }
        return item;
      });

      const productTitle = product?.title || 'Chi tiết sản phẩm';
      if (prevItems.length === 0 || prevItems[prevItems.length - 1].label !== productTitle) {
        prevItems.push({ label: productTitle });
      }
      console.log('DEBUG: breadcrumbItems after transformation in ProductDetail:', prevItems);
      return prevItems;
    }

    return [
      { label: 'Trang chủ', path: '/', icon: <FaHome /> }, 
      { label: 'Sản phẩm', path: '/products' },
      { label: product?.title || 'Chi tiết sản phẩm' }
    ];
  }, [product?.title, location.state]); 

  // Auto slideshow effect
  useEffect(() => {
    if (autoSlide && product && productImages.length > 1) {
      autoSlideRef.current = setInterval(() => {
        setSelectedImage(prev => prev === productImages.length - 1 ? 0 : prev + 1);
      }, 3000); 
    } else {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    }

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [autoSlide, product, productImages.length]);

  const handleManualImageChange = (index) => {
    setSelectedImage(index);
    setAutoSlide(false); 
  };

  useEffect(() => {
    if (!product || productImages.length <= 1) return;
    
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handleManualImageChange(selectedImage === 0 ? productImages.length - 1 : selectedImage - 1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleManualImageChange(selectedImage === productImages.length - 1 ? 0 : selectedImage + 1);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage, product, autoSlide]);

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-error">
        <i className="fas fa-exclamation-triangle"></i>
        <h2>{error || 'Không tìm thấy sản phẩm'}</h2>
        <button onClick={() => navigate('/products')} className="back-btn">
          Quay lại danh sách sản phẩm
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Product Detail */}
        <div className="product-detail">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              <img
                src={productImages[selectedImage] || '/api/placeholder/400/400'}
                alt={product.title}
                onError={(e) => {
                  e.target.src = '/api/placeholder/400/400';
                }}
              />
              
              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    className="image-nav-btn prev-btn"
                    onClick={() => handleManualImageChange(selectedImage === 0 ? productImages.length - 1 : selectedImage - 1)}
                    aria-label="Previous image"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button
                    className="image-nav-btn next-btn"
                    onClick={() => handleManualImageChange(selectedImage === productImages.length - 1 ? 0 : selectedImage + 1)}
                    aria-label="Next image"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                  
                  {/* Auto-slide toggle */}
                  <button
                    className={`auto-slide-btn ${autoSlide ? 'active' : ''}`}
                    onClick={() => setAutoSlide(!autoSlide)}
                    title={autoSlide ? 'Stop auto slideshow' : 'Start auto slideshow'}
                  >
                    <i className={`fas ${autoSlide ? 'fa-pause' : 'fa-play'}`}></i>
                  </button>
                </>
              )}
              
              {/* Image Indicators */}
              {productImages.length > 1 && (
                <div className="image-indicators">
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => handleManualImageChange(index)}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {productImages.length > 1 && (
              <div className="image-thumbnails">
                {productImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className={selectedImage === index ? 'active' : ''}
                    onClick={() => handleManualImageChange(index)}
                    onError={(e) => {
                      e.target.src = '/api/placeholder/100/100';
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <h1>{product.title}</h1>
            {product.type && <p className="product-category">{product.type}</p>}

            <div className="product-price">
              {product.priceOld && product.priceNew && product.priceOld > product.priceNew ? (
                <>
                  <span className="discounted-price">
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

            <div className="product-details">
              <div className="detail-item">
                <span className="label">Tình trạng:</span>
                <span className={`status ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.quantity > 0 ? `Còn hàng (${product.quantity})` : 'Hết hàng'}
                </span>
              </div>
              {product.manufacturer && (
                <div className="detail-item">
                  <span className="label">Nhà sản xuất:</span>
                  <span>{product.manufacturer}</span>
                </div>
              )}
              {product.registrationNumber && (
                <div className="detail-item">
                  <span className="label">Số đăng ký:</span>
                  <span>{product.registrationNumber}</span>
                </div>
              )}
              {product.activeIngredient && (
                <div className="detail-item">
                  <span className="label">Hoạt chất:</span>
                  <span>{product.activeIngredient}</span>
                </div>
              )}
              {product.dosageForm && (
                <div className="detail-item">
                  <span className="label">Dạng bào chế:</span>
                  <span>{product.dosageForm}</span>
                </div>
              )}
              {product.indication && (
                <div className="detail-item">
                  <span className="label">Chỉ định:</span>
                  <span>{product.indication}</span>
                </div>
              )}
              {product.noted && (
                <div className="detail-item">
                  <span className="label">Ghi chú:</span>
                  <span>{product.noted}</span>
                </div>
              )}
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <label>Số lượng:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.quantity}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={product.quantity === 0}
                >
                  <i className="fas fa-cart-plus"></i>
                  Thêm vào giỏ hàng
                </button>
                <button
                  className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
                  onClick={handleWishlistToggle}
                >
                  <i className={`fas fa-heart ${isInWishlist ? 'filled' : ''}`}></i>
                  {isInWishlist ? 'Đã yêu thích' : 'Yêu thích'}
                </button>
              </div>
            </div>

          </div>

        </div>
        
        {/* Product Description - Separate section */}
        <div className="product-description-section">
          <div className="product-description">
            <h3>Mô tả sản phẩm</h3>
            <div
              className={`description-content ${showFullDescription ? 'expanded' : 'collapsed'}${noFade ? ' no-fade' : ''}`}
              ref={descriptionRef}
            >
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
            {showToggleDescription && (
              <button
                className="description-toggle-btn"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
                <i className={`fas fa-chevron-${showFullDescription ? 'up' : 'down'}`}></i>
              </button>
            )}
          </div>
        </div>


        {relatedProducts.length > 0 && (
          <div className="related-products-slider">
            <h2 style={{ marginBottom: 16 }}>Sản phẩm có cùng thương hiệu</h2>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button
                className="slider-arrow left"
                onClick={handleRelatedPrev}
                disabled={relatedIndex === 0}
                style={{ position: 'absolute', left: 0, zIndex: 2, background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: '#1976d2', padding: 8 }}
                aria-label="Previous related products"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="related-products-track" style={{ overflow: 'hidden', width: '100%' }}>
                <div
                  className="related-products-grid"
                  style={{
                    display: 'flex',
                    gap: 16,
                    transition: 'transform 0.4s cubic-bezier(.4,0,.2,1)',
                    transform: `translateX(-${relatedIndex * (100 / relatedVisible)}%)`
                  }}
                >
                  {relatedProducts.slice(relatedIndex, relatedIndex + relatedVisible).map(relatedProduct => (
                    <div key={relatedProduct.id} style={{ minWidth: 220, maxWidth: 220, flex: '0 0 220px' }}>
                      <ProductCard
                        product={relatedProduct}
                        formatPrice={formatPrice}
                        onProductClick={() => navigate(`/products/${relatedProduct.slug}`)}
                        onWishlistToggle={() => handleWishlistToggle(relatedProduct.id)}
                        onAddToCart={() => handleAddToCart(relatedProduct.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                className="slider-arrow right"
                onClick={handleRelatedNext}
                disabled={relatedIndex >= Math.max(relatedProducts.length - relatedVisible, 0)}
                style={{ position: 'absolute', right: 0, zIndex: 2, background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: '#1976d2', padding: 8 }}
                aria-label="Next related products"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;