import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import { profileService } from '../../services/profileService';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  const paymentMethods = [
    { id: 'COD', name: 'Thanh toán khi nhận hàng (COD)', icon: 'fas fa-truck' },
    { id: 'BANK_TRANSFER', name: 'Chuyển khoản ngân hàng', icon: 'fas fa-university' },
    { id: 'CREDIT_CARD', name: 'Thẻ tín dụng', icon: 'fas fa-credit-card' },
    { id: 'MOMO', name: 'Ví điện tử MoMo', icon: 'fas fa-mobile-alt' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Get selected items from cart
    const items = location.state?.selectedItems || [];
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    
    setSelectedItems(items);
    fetchUserProfile();
  }, [user, navigate, location.state]);

  const fetchUserProfile = async () => {
    try {
      const response = await profileService.getProfile();
      const profile = response.data;
      
      // Pre-fill shipping info from profile
      setShippingInfo({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        email: profile.email || '',
        address: profile.address || '',
        city: profile.city || '',
        district: profile.district || '',
        ward: profile.ward || '',
        note: ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['fullName', 'phone', 'email', 'address', 'city'];
    for (let field of required) {
      if (!shippingInfo[field].trim()) {
        alert(`Vui lòng nhập ${getFieldLabel(field)}`);
        return false;
      }
    }
    
    // Validate phone
    if (!/^[0-9]{10,11}$/.test(shippingInfo.phone)) {
      alert('Số điện thoại không hợp lệ');
      return false;
    }
    
    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      alert('Email không hợp lệ');
      return false;
    }
    
    return true;
  };

  const getFieldLabel = (field) => {
    const labels = {
      fullName: 'Họ và tên',
      phone: 'Số điện thoại',
      email: 'Email',
      address: 'Địa chỉ',
      city: 'Thành phố',
      district: 'Quận/Huyện',
      ward: 'Phường/Xã'
    };
    return labels[field] || field;
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      const price = item.product.discount > 0 
        ? item.product.price * (1 - item.product.discount / 100)
        : item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const orderData = {
        items: selectedItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.discount > 0 
            ? item.product.price * (1 - item.product.discount / 100)
            : item.product.price
        })),
        shippingAddress: {
          fullName: shippingInfo.fullName,
          phone: shippingInfo.phone,
          email: shippingInfo.email,
          address: shippingInfo.address,
          city: shippingInfo.city,
          district: shippingInfo.district,
          ward: shippingInfo.ward
        },
        paymentMethod: paymentMethod,
        note: shippingInfo.note,
        totalAmount: calculateTotal()
      };
      
      const response = await orderService.createOrder(orderData);
      
      // Redirect to success page or order detail
      navigate('/orders', { 
        state: { 
          message: 'Đặt hàng thành công!',
          orderId: response.data.id 
        } 
      });
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Thanh toán</h1>
          <div className="checkout-steps">
            <div className="step active">
              <span>1</span>
              <p>Thông tin giao hàng</p>
            </div>
            <div className="step active">
              <span>2</span>
              <p>Phương thức thanh toán</p>
            </div>
            <div className="step">
              <span>3</span>
              <p>Hoàn thành</p>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-form">
            {/* Shipping Information */}
            <div className="form-section">
              <h3>Thông tin giao hàng</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    placeholder="Nhập email"
                  />
                </div>
                <div className="form-group">
                  <label>Thành phố *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    placeholder="Nhập thành phố"
                  />
                </div>
                <div className="form-group">
                  <label>Quận/Huyện</label>
                  <input
                    type="text"
                    name="district"
                    value={shippingInfo.district}
                    onChange={handleInputChange}
                    placeholder="Nhập quận/huyện"
                  />
                </div>
                <div className="form-group">
                  <label>Phường/Xã</label>
                  <input
                    type="text"
                    name="ward"
                    value={shippingInfo.ward}
                    onChange={handleInputChange}
                    placeholder="Nhập phường/xã"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Địa chỉ *</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ chi tiết"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Ghi chú đơn hàng</label>
                  <textarea
                    name="note"
                    value={shippingInfo.note}
                    onChange={handleInputChange}
                    placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="form-section">
              <h3>Phương thức thanh toán</h3>
              <div className="payment-methods">
                {paymentMethods.map(method => (
                  <div key={method.id} className="payment-method">
                    <input
                      type="radio"
                      id={method.id}
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor={method.id}>
                      <i className={method.icon}></i>
                      <span>{method.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h3>Tóm tắt đơn hàng</h3>
            
            <div className="order-items">
              {selectedItems.map(item => (
                <div key={item.id} className="order-item">
                  <img
                    src={item.product.image || '/api/placeholder/60/60'}
                    alt={item.product.name}
                    onError={(e) => {
                      e.target.src = '/api/placeholder/60/60';
                    }}
                  />
                  <div className="item-info">
                    <h4>{item.product.name}</h4>
                    <p>Số lượng: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    {formatPrice(
                      (item.product.discount > 0 
                        ? item.product.price * (1 - item.product.discount / 100)
                        : item.product.price
                      ) * item.quantity
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-total">
              <div className="total-row">
                <span>Tạm tính:</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
              <div className="total-row">
                <span>Phí vận chuyển:</span>
                <span className="free-shipping">Miễn phí</span>
              </div>
              <div className="total-row final-total">
                <span>Tổng cộng:</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
            </div>
            
            <button
              className="place-order-btn"
              onClick={handleSubmitOrder}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Đang xử lý...
                </>
              ) : (
                'Đặt hàng'
              )}
            </button>
            
            <button
              className="back-to-cart-btn"
              onClick={() => navigate('/cart')}
            >
              Quay lại giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
