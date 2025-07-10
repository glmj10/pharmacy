import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import Slider from 'react-slick';
import {
  FaShoppingCart,
  FaHeart,
  FaEye,
  FaArrowRight,
  FaPhoneAlt,
  FaTruck,
  FaShieldAlt,
  FaHeadset,
  FaStar,
  FaQuoteLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCommentDots,
} from 'react-icons/fa';
import './Home.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [contactForm, setContactForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    content: ''
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productService.getAllProducts({ pageSize: 8 });
        
        // Handle ApiResponse<PageResponse<List<ProductResponse>>> structure
        if (response?.data?.data?.content && Array.isArray(response.data.data.content)) {
          setFeaturedProducts(response.data.data.content);
        } else if (response?.data?.content && Array.isArray(response.data.content)) {
          setFeaturedProducts(response.data.content);
        } else if (response?.data && Array.isArray(response.data)) {
          setFeaturedProducts(response.data);
        } else {
          console.warn('Unexpected products response structure:', response);
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setFeaturedProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    const fetchCategories = async () => {
      try {
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
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  const testimonials = [
    {
      id: 1,
      name: 'Nguyễn Thị Lan',
      avatar: '/api/placeholder/60/60',
      rating: 5,
      comment: 'Thuốc chính hãng, giao hàng nhanh, nhân viên tư vấn rất nhiệt tình.',
      location: 'TP.HCM'
    },
    {
      id: 2,
      name: 'Trần Văn Minh',
      avatar: '/api/placeholder/60/60',
      rating: 5,
      comment: 'Đã mua thuốc nhiều lần, chất lượng tốt, giá cả hợp lý.',
      location: 'Hà Nội'
    },
    {
      id: 3,
      name: 'Phạm Thị Hoa',
      avatar: '/api/placeholder/60/60',
      rating: 5,
      comment: 'Dịch vụ tuyệt vời, thuốc được giao đúng hẹn và đóng gói cẩn thận.',
      location: 'Đà Nẵng'
    },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactMessage('');

    try {
      const response = await fetch('/api/v1/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();
      
      if (response.ok) {
        setContactMessage('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
        setContactForm({
          fullName: '',
          email: '',
          phoneNumber: '',
          address: '',
          content: ''
        });
      } else {
        setContactMessage(data.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setContactMessage('Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setContactLoading(false);
    }
  };

  // Slider settings
  const categorySliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  const productSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  const testimonialSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    centerMode: false,
    centerPadding: '0px',
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Nhà Thuốc Online
                <span className="title-highlight">Uy Tín Hàng Đầu</span>
              </h1>
              <p className="hero-description">
                Cung cấp thuốc chính hãng, thực phẩm chức năng và dịch vụ tư vấn 
                sức khỏe chuyên nghiệp. Giao hàng nhanh chóng, tận tâm phục vụ.
              </p>
              <div className="hero-buttons">
                <Link to="/products" className="btn btn-primary btn-lg">
                  Mua Thuốc Ngay
                  <FaArrowRight />
                </Link>
                <a href="tel:1800-1234" className="btn btn-outline btn-lg">
                  <FaPhoneAlt />
                  Hotline: 1800-1234
                </a>
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">100K+</span>
                  <span className="stat-label">Khách hàng tin tưởng</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">5000+</span>
                  <span className="stat-label">Sản phẩm chính hãng</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">99%</span>
                  <span className="stat-label">Khách hàng hài lòng</span>
                </div>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-image-container">
                <img 
                  src="/api/placeholder/600/400" 
                  alt="Nhà thuốc online" 
                  className="hero-img"
                />
                <div className="hero-badge">
                  <FaShieldAlt className="badge-icon" />
                  <span>100% Thuốc Chính Hãng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaTruck />
              </div>
              <h3>Giao Hàng Nhanh</h3>
              <p>Giao hàng trong 2-4 giờ tại nội thành, miễn phí với đơn hàng trên 200k</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaShieldAlt />
              </div>
              <h3>Thuốc Chính Hãng</h3>
              <p>100% thuốc thật, có nguồn gốc rõ ràng, được kiểm duyệt nghiêm ngặt</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaHeadset />
              </div>
              <h3>Tư Vấn Miễn Phí</h3>
              <p>Đội ngũ dược sĩ giàu kinh nghiệm tư vấn 24/7, hỗ trợ khách hàng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Danh Mục Sản Phẩm</h2>
            <p className="section-description">
              Khám phá các danh mục sản phẩm đa dạng của chúng tôi
            </p>
          </div>
          
          {loadingCategories ? (
            <div className="loading-grid">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="category-card-skeleton"></div>
              ))}
            </div>
          ) : (
            <Slider {...categorySliderSettings}>
              {categories?.map((category) => (
                <div key={category.id} className="category-slide">
                  <Link
                    to={`/products?category=${category.slug}`}
                    className="category-card"
                  >
                    <div className="category-image">
                      <img 
                        src={category.thumbnail || '/api/placeholder/300/200'} 
                        alt={category.name} 
                      />
                    </div>
                    <div className="category-content">
                      <h3>{category.name}</h3>
                      <span className="category-count">
                        Xem sản phẩm
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </Slider>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Sản Phẩm Nổi Bật</h2>
            <p className="section-description">
              Những sản phẩm được khách hàng tin tưởng và lựa chọn nhiều nhất
            </p>
          </div>
          
          {loadingProducts ? (
            <div className="loading-grid">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="product-card-skeleton"></div>
              ))}
            </div>
          ) : (
            <Slider {...productSliderSettings}>
              {featuredProducts?.map((product) => (
                <div key={product.id} className="product-slide">
                  <div className="product-card">
                    <div className="product-image">
                      <img 
                        src={product.thumbnailUrl || '/api/placeholder/300/300'} 
                        alt={product.title} 
                      />
                      <div className="product-badges">
                        {product.priceOld && product.priceNew && product.priceOld > product.priceNew && (
                          <span className="badge badge-discount">
                            -{Math.round((1 - product.priceNew / product.priceOld) * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="product-actions">
                        <button className="action-btn">
                          <FaHeart />
                        </button>
                        <Link to={`/products/${product.slug}`} className="action-btn">
                          <FaEye />
                        </Link>
                      </div>
                    </div>
                    <div className="product-content">
                      <h3 className="product-name">{product.title}</h3>
                      <p className="product-description">{product.description}</p>
                      <div className="product-price">
                        {product.priceOld && product.priceNew && product.priceOld > product.priceNew ? (
                          <>
                            <span className="current-price">
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
                      <button className="btn btn-primary btn-sm add-to-cart">
                        <FaShoppingCart />
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          )}
          
          <div className="section-footer" style={{ marginTop: '60px' }}>
            <Link to="/products" className="btn btn-outline btn-lg">
              Xem Tất Cả Sản Phẩm
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Khách Hàng Nói Gì</h2>
            <p className="section-description">
              Trải nghiệm thực tế từ khách hàng đã sử dụng dịch vụ
            </p>
          </div>
          
          <div style={{ paddingTop: '30px', paddingBottom: '60px' }}>
            <Slider {...testimonialSliderSettings}>
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="testimonial-slide">
                  <div className="testimonial-card">
                    <div className="testimonial-quote">
                      <FaQuoteLeft className="quote-icon" />
                    </div>
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, index) => (
                        <FaStar key={index} className="star" />
                      ))}
                    </div>
                    <p className="testimonial-text">{testimonial.comment}</p>
                    <div className="testimonial-author">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        className="author-avatar"
                      />
                      <div className="author-info">
                        <h4 className="author-name">{testimonial.name}</h4>
                        <p className="author-location">{testimonial.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <div className="section-header">
                <h2 className="section-title">Liên Hệ Với Chúng Tôi</h2>
                <p className="section-description">
                  Hãy để lại thông tin liên hệ, chúng tôi sẽ tư vấn cho bạn sớm nhất
                </p>
              </div>
              
              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-icon">
                    <FaPhoneAlt />
                  </div>
                  <div className="contact-text">
                    <h4>Hotline</h4>
                    <p>1800-1234 (Miễn phí)</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">
                    <FaEnvelope />
                  </div>
                  <div className="contact-text">
                    <h4>Email</h4>
                    <p>info@nhathuoc.com</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="contact-text">
                    <h4>Địa chỉ</h4>
                    <p>123 Đường ABC, Quận 1, TP.HCM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="contact-form-wrapper">
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullName">
                      <FaUser />
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={contactForm.fullName}
                      onChange={handleContactChange}
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phoneNumber">
                      <FaPhone />
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={contactForm.phoneNumber}
                      onChange={handleContactChange}
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">
                      <FaEnvelope />
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      placeholder="Nhập địa chỉ email"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="address">
                      <FaMapMarkerAlt />
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={contactForm.address}
                      onChange={handleContactChange}
                      placeholder="Nhập địa chỉ (tùy chọn)"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="content">
                    <FaCommentDots />
                    Nội dung *
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={contactForm.content}
                    onChange={handleContactChange}
                    placeholder="Nhập nội dung cần tư vấn..."
                    rows="5"
                    required
                  ></textarea>
                </div>
                
                {contactMessage && (
                  <div className={`contact-message ${contactMessage.includes('Cảm ơn') ? 'success' : 'error'}`}>
                    {contactMessage}
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg contact-submit"
                  disabled={contactLoading}
                >
                  {contactLoading ? 'Đang gửi...' : 'Gửi liên hệ'}
                  <FaArrowRight />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">
              Bắt Đầu Mua Sắm Ngay Hôm Nay
            </h2>
            <p className="cta-description">
              Tải ứng dụng hoặc đặt hàng online để nhận ưu đãi đặc biệt
            </p>
            <div className="cta-buttons">
              <Link to="/products" className="btn btn-primary btn-lg">
                Mua Ngay
              </Link>
              <a href="tel:1800-1234" className="btn btn-secondary btn-lg">
                Gọi Tư Vấn
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
