import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaShieldAlt,
  FaTruck,
  FaHeadset,
  FaAward,
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      {/* Features Section */}
      <div className="footer-features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <FaShieldAlt />
              </div>
              <div className="feature-content">
                <h4>Thuốc Chính Hãng</h4>
                <p>100% thuốc thật, có nguồn gốc rõ ràng</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <FaTruck />
              </div>
              <div className="feature-content">
                <h4>Giao Hàng Nhanh</h4>
                <p>Giao hàng trong 2-4 giờ tại nội thành</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <FaHeadset />
              </div>
              <div className="feature-content">
                <h4>Hỗ Trợ 24/7</h4>
                <p>Tư vấn dược sĩ miễn phí mọi lúc</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <FaAward />
              </div>
              <div className="feature-content">
                <h4>Uy Tín Hàng Đầu</h4>
                <p>Được tin tưởng bởi hàng triệu khách hàng</p>
              </div>
            </div>
        {/* New Feature Item 1 */}
        <div className="feature-item">
          <div className="feature-icon">
            <FaEnvelope />
          </div>
          <div className="feature-content">
            <h4>Hỗ Trợ Email</h4>
            <p>Phản hồi nhanh qua email, hỗ trợ mọi thắc mắc</p>
          </div>
        </div>
        {/* New Feature Item 2 */}
        <div className="feature-item">
          <div className="feature-icon">
            <FaMapMarkerAlt />
          </div>
          <div className="feature-content">
            <h4>Hệ Thống Toàn Quốc</h4>
            <p>Phủ sóng rộng khắp các tỉnh thành Việt Nam</p>
          </div>
        </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-content">
            {/* Company Info */}
            <div className="footer-section">
              <div className="footer-logo">
                <div className="logo-icon">
                  <span className="logo-cross">⚕</span>
                </div>
                <span className="logo-text">Nhà Thuốc Online</span>
              </div>
              <p className="footer-desc">
                Nhà thuốc trực tuyến hàng đầu Việt Nam, cung cấp thuốc chính hãng, 
                thực phẩm chức năng và dịch vụ tư vấn sức khỏe chuyên nghiệp.
              </p>
              <div className="social-links">
                <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer">
                  <FaFacebookF />
                </a>
                <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer">
                  <FaInstagram />
                </a>
                <a href="https://twitter.com" className="social-link" target="_blank" rel="noopener noreferrer">
                  <FaTwitter />
                </a>
                <a href="https://youtube.com" className="social-link" target="_blank" rel="noopener noreferrer">
                  <FaYoutube />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3 className="footer-title">Liên Kết Nhanh</h3>
              <div className="footer-links">
                <Link to="/products" className="footer-link">Sản phẩm</Link>
                <Link to="/about" className="footer-link">Về chúng tôi</Link>
                <Link to="/contact" className="footer-link">Liên hệ</Link>
                <Link to="/blog" className="footer-link">Tin tức</Link>
                <Link to="/faq" className="footer-link">Câu hỏi thường gặp</Link>
              </div>
            </div>

            {/* Product Categories */}
            <div className="footer-section">
              <h3 className="footer-title">Danh Mục Sản Phẩm</h3>
              <div className="footer-links">
                <Link to="/products?category=thuoc-khong-ke-don" className="footer-link">
                  Thuốc không kê đơn
                </Link>
                <Link to="/products?category=thuc-pham-chuc-nang" className="footer-link">
                  Thực phẩm chức năng
                </Link>
                <Link to="/products?category=cham-soc-suc-khoe" className="footer-link">
                  Chăm sóc sức khỏe
                </Link>
                <Link to="/products?category=me-va-be" className="footer-link">
                  Mẹ và bé
                </Link>
                <Link to="/products?category=lam-dep" className="footer-link">
                  Làm đẹp
                </Link>
              </div>
            </div>

            {/* Contact Info */}
            <div className="footer-section">
              <h3 className="footer-title">Thông Tin Liên Hệ</h3>
              <div className="contact-info">
                <div className="contact">
                  <span>123 Đường ABC, Quận 1, TP.HCM</span>
                </div>
                <div className="contact">
                  <span>1800-1234 (Miễn phí)</span>
                </div>
                <div className="contact">
                  <span>info@nhathuoc.com</span>
                </div>
              </div>
              
              <div className="business-hours">
                <h4>Giờ Làm Việc:</h4>
                <p>Thứ 2 - Chủ Nhật: 7:00 - 22:00</p>
                <p>Hotline: 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <div className="footer-bottom-left">
              <p>&copy; 2024 Nhà Thuốc Online. Tất cả quyền được bảo lưu.</p>
            </div>
            <div className="footer-bottom-right">
              <Link to="/privacy" className="footer-bottom-link">
                Chính sách bảo mật
              </Link>
              <Link to="/terms" className="footer-bottom-link">
                Điều khoản sử dụng
              </Link>
              <Link to="/sitemap" className="footer-bottom-link">
                Sơ đồ trang web
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
