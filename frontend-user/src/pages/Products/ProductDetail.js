import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthAction } from '../../hooks/useAuthAction';
import { wishlistService } from '../../services/wishlistService';
import { FaChevronRight, FaHome } from 'react-icons/fa';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import './ProductDetail.css';
import './ProductDetailDescription.css'

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
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

  // Use useMemo to safely compute productImages
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
        // Case: ApiResponse { data: ProductResponse }
        productData = response.data;
      } else if (response) {
        // Case: Direct ProductResponse
        productData = response;
      } else {
        throw new Error('Invalid product response');
      }


      setProduct(productData);

      // Set wishlist status from product response
      setIsInWishlist(productData.inWishlist || false);

      // Fetch related products by type (since categorySlug is not available in ProductResponse)
      if (productData?.type) {
        const relatedResponse = await productService.getAllProducts({
          title: productData.type, // Use type as search term
          pageSize: 4
        });

        // Handle related products response
        let relatedData = [];
        if (relatedResponse?.data?.content) {
          relatedData = relatedResponse.data.content;
        } else if (relatedResponse?.content) {
          relatedData = relatedResponse.content;
          console.log(relatedProducts)
        } else if (Array.isArray(relatedResponse)) {
          relatedData = relatedResponse;
        }

        // Filter out current product
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
    // Luôn kiểm tra lại sau khi component đã render hoàn chỉnh
    setTimeout(() => {
      if (descriptionRef.current && product?.description) {
        // Phát hiện tràn bằng cách kiểm tra chiều cao scroll > chiều cao hiển thị
        const isOverflow = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight + 5;

        // LUÔN hiển thị nút "Xem thêm" nếu mô tả dài (> 100 ký tự)
        const isLongDescription = product.description.length > 100;

        // Kiểm tra có nhiều dòng
        const hasMultipleLines = product.description.split('\n').length > 1;

        // Hiển thị nút "Xem thêm" nếu có tràn HOẶC mô tả dài HOẶC có nhiều dòng
        // Ở đây chúng ta ưu tiên isLongDescription để đảm bảo luôn hiển thị khi có nhiều nội dung
        const shouldShowToggle = isLongDescription || isOverflow || hasMultipleLines;

        setShowToggleDescription(shouldShowToggle);
        setNoFade(!isOverflow); // Chỉ ẩn hiệu ứng mờ khi không bị tràn
      }
    }, 100); // Đợi 100ms để DOM render xong
  }, [product?.description, showFullDescription]);

  const handleAddToCart = executeWithAuth(async () => {
    try {
      await addToCart(product.id, quantity);
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  });

  const handleWishlistToggle = executeWithAuth(async () => {
    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(product.id);
        setIsInWishlist(false);
      } else {
        await wishlistService.addToWishlist(product.id);
        setIsInWishlist(true);
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

  const renderBreadcrumb = () => {
    return (
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-item">
          <FaHome />
          Trang chủ
        </Link>
        <FaChevronRight className="breadcrumb-separator" />
        <Link to="/products" className="breadcrumb-item">
          Sản phẩm
        </Link>
        <FaChevronRight className="breadcrumb-separator" />
        <span className="breadcrumb-item active">{product?.title || 'Chi tiết sản phẩm'}</span>
      </nav>
    );
  };
  
  const breadcrumbItems = [
    { label: 'Trang chủ', path: '/', icon: <FaHome /> },
    { label: 'Sản phẩm', path: '/products' },
    { label: product?.title || 'Chi tiết sản phẩm' }
  ];

  // Auto slideshow effect
  useEffect(() => {
    if (autoSlide && product && productImages.length > 1) {
      autoSlideRef.current = setInterval(() => {
        setSelectedImage(prev => prev === productImages.length - 1 ? 0 : prev + 1);
      }, 3000); // Change image every 3 seconds
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

  // Stop auto slide on manual interaction
  const handleManualImageChange = (index) => {
    setSelectedImage(index);
    setAutoSlide(false); // Stop auto slide when user manually changes image
  };

  // Keyboard navigation for images
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

    // Only add listener when component is focused or images are in view
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

          {/* Product Description - Spans full width below images and info */}
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
          <div className="related-products">
            <h2>Sản phẩm liên quan</h2>
            <div className="related-products-grid">
              {relatedProducts.map(relatedProduct => (
                <div key={relatedProduct.id} className="related-product-card">
                  <div className="related-product-image" onClick={() => navigate(`/products/${relatedProduct.slug}`)}>
                    <img
                      src={relatedProduct.thumbnailUrl || '/api/placeholder/200/200'}
                      alt={relatedProduct.title}
                      onError={(e) => {
                        e.target.src = '/api/placeholder/200/200';
                      }}
                    />
                  </div>
                  <div className="related-product-info">
                    <h4 onClick={() => navigate(`/products/${relatedProduct.slug}`)}>
                      {relatedProduct.title}
                    </h4>
                    <p className="related-product-price">
                      {formatPrice(relatedProduct.priceNew || relatedProduct.priceOld)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
