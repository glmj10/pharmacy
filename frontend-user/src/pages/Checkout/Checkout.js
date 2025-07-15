import { useState, useEffect, useCallback } from 'react';
import { FaTruck, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { orderService } from '../../services/orderService';
import { cartService } from '../../services/cartService';
import { profileService } from '../../services/profileService';
import AddressModal from '../../components/AddressModal/AddressModal';
import { toast } from 'react-toastify';
import './Checkout.css'; // Đảm bảo CSS được import

const Checkout = () => {
  // Không cần fetch chi tiết sản phẩm nữa, chỉ dùng dữ liệu từ API

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { openLoginModal } = useAuthModal();
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    note: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('OFFLINE');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showMomoModal, setShowMomoModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [createdOrderId, setCreatedOrderId] = useState(null);

  const paymentMethods = [
    {
      id: 'OFFLINE',
      name: 'Thanh toán khi nhận hàng (COD)',
      icon: <FaTruck style={{ fontSize: '1.5rem', marginRight: 8 }} />,
    },
    {
      id: 'VNPAY',
      name: 'Thanh toán qua VNPAY',
      icon: <FaCreditCard style={{ fontSize: '1.5rem', marginRight: 8, color: '#1976d2' }} />,
      logo: '/images/vnpay-logo.png',
    },
    {
      id: 'MOMO',
      name: 'Thanh toán qua MoMo',
      icon: <FaMoneyBillWave style={{ fontSize: '1.5rem', marginRight: 8, color: '#a50064' }} />,
      logo: '/images/momo-logo.png',
    }
  ];

  const fetchAddressesAndUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const userProfileRes = await profileService.getUserProfiles();
      const userProfile = userProfileRes.data;

      const addressesRes = await profileService.getUserProfiles();
      const userAddresses = addressesRes.data;

      setAddresses(userAddresses);


      if (userAddresses && userAddresses.length > 0) {
        const defaultAddress = userAddresses[0];

        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id); 
          setShippingInfo(prev => ({
            ...prev,
            fullName: defaultAddress.fullName || '',
            phoneNumber: defaultAddress.phoneNumber || '',
            address: defaultAddress.address || '',
          }));
        } else {
          setSelectedAddressId(''); 
          setShippingInfo(prev => ({
            ...prev,
            fullName: userProfile.fullName || '',
            phoneNumber: userProfile.phoneNumber || '',
            address: userProfile.address || '',
          }));
        }
      } else {
        setSelectedAddressId(''); 
        setShippingInfo(prev => ({
          ...prev,
          fullName: userProfile.fullName || '',
          phoneNumber: userProfile.phoneNumber || '',
          address: userProfile.address || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Không thể tải thông tin cá nhân và địa chỉ.');
      setShippingInfo(prev => ({ 
        ...prev,
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || '',
        address: user?.address || '',
      }));
    } finally {
      setLoading(false);
    }
  }, [user]); // dependencies for useCallback

  useEffect(() => {
    if (!user) {
      openLoginModal();
      return;
    }

    // Lấy danh sách sản phẩm cần thanh toán từ API mới
    const fetchCheckoutItems = async () => {
      setLoading(true);
      try {
        const res = await cartService.getCartItemsForCheckout();
        // response.data là mảng các đơn hàng, mỗi đơn hàng có cartItems
        const orders = res.data || [];
        if (!orders.length || !orders[0].cartItems || orders[0].cartItems.length === 0) {
          navigate('/cart');
          return;
        }
        setSelectedItems(orders[0].cartItems);
      } catch (err) {
        toast.error('Không thể lấy danh sách sản phẩm cần thanh toán.');
        navigate('/cart');
      } finally {
        setLoading(false);
        fetchAddressesAndUserProfile();
      }
    };
    fetchCheckoutItems();
  }, [user, navigate, location.state, openLoginModal, fetchAddressesAndUserProfile]);

  const handleAddressSelectChange = (e) => {
    const id = e.target.value;
    setSelectedAddressId(id);

    const selectedAddr = addresses.find(addr => String(addr.id) === id);
    if (selectedAddr) {
      setShippingInfo(prev => ({
        ...prev,
        fullName: selectedAddr.fullName || '',
        phoneNumber: selectedAddr.phoneNumber || '',
        address: selectedAddr.address || '',
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'note') {
        setShippingInfo(prev => ({
            ...prev,
            note: value
        }));
    }
  };

  const getFieldLabel = (field) => {
    switch (field) {
      case 'fullName': return 'Họ và tên';
      case 'phoneNumber': return 'Số điện thoại'; // Đổi thành phoneNumber
      case 'address': return 'Địa chỉ';
      default: return field;
    }
  };

  const validateForm = () => {
    const required = ['fullName', 'phoneNumber', 'address']; // Đổi thành phoneNumber
    for (let field of required) {
      if (!shippingInfo[field] || !shippingInfo[field].trim()) {
        toast.warn(`Vui lòng nhập ${getFieldLabel(field)}.`);
        return false;
      }
    }

    if (!paymentMethod) {
      toast.warn('Vui lòng chọn phương thức thanh toán.');
      return false;
    }
    return true;
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      // Sử dụng priceNew nếu có, nếu không thì priceOld hoặc price
      const basePrice = item.product?.priceNew ?? item.product?.priceOld ?? item.product?.price ?? 0;
      const discount = item.product?.discount ?? 0;
      const price = discount > 0
        ? basePrice * (1 - discount / 100)
        : basePrice;
      return total + (price * item.quantity);
    }, 0);
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      return;
    }

    if (paymentMethod === 'MOMO') {
      setShowMomoModal(true);
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        profileId: selectedAddressId && selectedAddressId !== 'new' ? Number(selectedAddressId) : null,
        note: shippingInfo.note,
        paymentMethod,
        shippingInfo: {
            fullName: shippingInfo.fullName,
            phoneNumber: shippingInfo.phoneNumber,
            address: shippingInfo.address,
        }
      };

      const response = await orderService.createOrder(orderData);
      if (paymentMethod === 'VNPAY' && response?.message === 'Chuyển hướng đến VNPay' && response?.data) {
        window.location.href = response.data;
        return;
      }
      setCreatedOrderId(response.data.id);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
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
    <>
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
                <h3>Thông tin nhận hàng</h3>
                <div className="address-selection-container">
                  <div className="form-group address-select-group">
                    <label htmlFor="address-select">Chọn địa chỉ đã lưu:</label>
                    <select
                      id="address-select"
                      value={selectedAddressId}
                      onChange={handleAddressSelectChange}
                      disabled={loading || addresses.length === 0}
                    >
                      {addresses.map(addr => (
                        <option key={addr.id} value={addr.id}>
                          {addr.fullName} - {addr.phoneNumber} - {addr.address}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="btn-manage-address"
                    onClick={() => setShowAddressModal(true)}
                  >
                    Quản lý địa chỉ
                  </button>
                </div>

                {/* Các trường input luôn cho phép chỉnh sửa */}
                <div className="form-grid">
                    <div className="form-group">
                        <label>Họ và tên *</label>
                        <input
                            type="text"
                            name="fullName"
                            value={shippingInfo.fullName}
                            placeholder="Nhập họ và tên"
                            disabled
                        />
                    </div>
                    <div className="form-group">
                        <label>Số điện thoại *</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={shippingInfo.phoneNumber}
                            placeholder="Nhập số điện thoại"
                            disabled
                        />
                    </div>
                    {/* Đã bỏ trường email */}
                    <div className="form-group full-width">
                        <label>Địa chỉ *</label>
                        <input
                            type="text"
                            name="address"
                            value={shippingInfo.address}
                            placeholder="Nhập địa chỉ chi tiết"
                            disabled
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
                      <label htmlFor={method.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {method.icon}
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
                {selectedItems.map(item => {
                  const basePrice = item.product?.priceNew ?? item.product?.priceOld ?? item.product?.price ?? 0;
                  const discount = item.product?.discount ?? 0;
                  const price = discount > 0
                    ? basePrice * (1 - discount / 100)
                    : basePrice;
                  return (
                    <div key={item.id} className="order-item">
                      <img
                        src={item.product?.thumbnailUrl || '/api/placeholder/60/60'}
                        alt={item.product?.title || 'Sản phẩm'}
                        onError={(e) => {
                          e.target.src = '/api/placeholder/60/60';
                        }}
                      />
                      <div className="item-info">
                        <h4>{item.product?.title || 'Sản phẩm'}</h4>
                        <p>Số lượng: {item.quantity}</p>
                        {discount > 0 && (
                          <p className="item-discount">Giảm giá: {discount}%</p>
                        )}
                      </div>
                      <div className="item-price">
                        {formatPrice(price * item.quantity)}
                        {discount > 0 && (
                          <span className="item-old-price">{formatPrice(basePrice * item.quantity)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
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

      {/* Address Management Modal */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSelectAddress={(addr) => { // Khi chọn địa chỉ từ modal
            setSelectedAddressId(addr ? addr.id : '');
            if (addr) {
                setShippingInfo(prev => ({
                    ...prev,
                    fullName: addr.fullName || '',
                    phoneNumber: addr.phoneNumber || '',
                    address: addr.address || '',
                }));
            } else {
                setShippingInfo(prev => ({ // Clear info if no address selected
                    ...prev,
                    fullName: '',
                    phoneNumber: '',
                    address: '',
                }));
            }
            setShowAddressModal(false); // Đóng modal sau khi chọn
        }}
        currentSelectedAddressId={selectedAddressId}
        onAddressChange={fetchAddressesAndUserProfile} // Gọi lại để refresh danh sách địa chỉ và trạng thái mặc định
      />

      {/* MoMo Feature Modal */}
      {showMomoModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '32px 24px',
            minWidth: 320,
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            textAlign: 'center',
            position: 'relative'
          }}>
            <h2 style={{ color: '#a50064', marginBottom: 16 }}>Tính năng đang được phát triển</h2>
            <p>Thanh toán qua MoMo sẽ sớm có mặt trên hệ thống. Vui lòng chọn phương thức khác.</p>
            <button
              style={{
                marginTop: 24,
                padding: '10px 24px',
                background: '#a50064',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: 16
              }}
              onClick={() => setShowMomoModal(false)}
            >Đóng</button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '40px 32px',
            minWidth: 340,
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            textAlign: 'center',
            position: 'relative',
            animation: 'fadeIn 0.5s'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'popV 0.7s cubic-bezier(.17,.67,.83,.67) both' }}>
                <circle cx="48" cy="48" r="48" fill="#4caf50"/>
                <path d="M28 50L43 65L68 40" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ color: '#4caf50', marginBottom: 12, fontSize: 28, fontWeight: 700 }}>Thanh toán thành công!</h2>
            <p style={{ fontSize: 16, marginBottom: 18 }}>Vui lòng kiểm tra email để xem thông tin chi tiết đơn hàng</p>
            <button
              style={{
                marginTop: 10,
                padding: '12px 32px',
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: 18
              }}
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/orders', {
                  state: {
                    orderId: createdOrderId
                  }
                });
              }}
            >Quay về đơn hàng</button>
          </div>
          <style>{`
            @keyframes popV {
              0% { transform: scale(0.5); opacity: 0; }
              60% { transform: scale(1.2); opacity: 1; }
              100% { transform: scale(1); }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default Checkout;