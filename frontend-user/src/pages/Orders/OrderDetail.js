import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { toast } from 'react-toastify';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (error) {
      toast.error('Không thể tải chi tiết đơn hàng: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffa500';
      case 'confirmed':
        return '#2196f3';
      case 'shipped':
        return '#9c27b0';
      case 'delivered':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'shipped':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        await orderService.cancelOrder(id);
        toast.success('Đã hủy đơn hàng thành công!');
        fetchOrderDetail();
      } catch (error) {
        toast.error('Không thể hủy đơn hàng: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="order-detail-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-container">
        <div className="error">
          <h2>Không tìm thấy đơn hàng</h2>
          <p>Đơn hàng không tồn tại hoặc đã bị xóa.</p>
          <Link to="/orders" className="back-btn">
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <div className="header-left">
          <Link to="/orders" className="back-link">
            ← Quay lại
          </Link>
          <h1>Chi tiết đơn hàng #{order.id}</h1>
          <p>Ngày đặt: {formatDate(order.createdAt)}</p>
        </div>
        <div className="header-right">
          <span
            className="status-badge"
            style={{ backgroundColor: getStatusColor(order.status) }}
          >
            {getStatusText(order.status)}
          </span>
        </div>
      </div>

      <div className="order-detail-content">
        <div className="order-main">
          <div className="order-items-section">
            <h3>Sản phẩm đã đặt</h3>
            <div className="order-items">
              {order.items.map(item => (
                <div key={item.id} className="order-item">
                  <img
                    src={item.product.imageUrl || '/api/placeholder/80/80'}
                    alt={item.product.name}
                    className="item-image"
                  />
                  <div className="item-details">
                    <h4>{item.product.name}</h4>
                    <p className="item-category">{item.product.category}</p>
                    <p className="item-description">{item.product.description}</p>
                  </div>
                  <div className="item-quantity">
                    <span>Số lượng: {item.quantity}</span>
                  </div>
                  <div className="item-price">
                    <span className="unit-price">{formatCurrency(item.price)}</span>
                    <span className="total-price">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-summary-section">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="summary-item">
              <span>Tạm tính:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="summary-item">
              <span>Phí vận chuyển:</span>
              <span>{formatCurrency(order.shippingFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="summary-item discount">
                <span>Giảm giá:</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="summary-item total">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="order-sidebar">
          <div className="shipping-info">
            <h3>Thông tin giao hàng</h3>
            <div className="info-item">
              <strong>Người nhận:</strong>
              <span>{order.shippingAddress.fullName}</span>
            </div>
            <div className="info-item">
              <strong>Số điện thoại:</strong>
              <span>{order.shippingAddress.phone}</span>
            </div>
            <div className="info-item">
              <strong>Địa chỉ:</strong>
              <span>{order.shippingAddress.address}</span>
            </div>
            <div className="info-item">
              <strong>Thành phố:</strong>
              <span>{order.shippingAddress.city}</span>
            </div>
            <div className="info-item">
              <strong>Mã bưu điện:</strong>
              <span>{order.shippingAddress.zipCode}</span>
            </div>
          </div>

          <div className="payment-info">
            <h3>Thông tin thanh toán</h3>
            <div className="info-item">
              <strong>Phương thức:</strong>
              <span>{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}</span>
            </div>
            <div className="info-item">
              <strong>Trạng thái:</strong>
              <span className={`payment-status ${order.paymentStatus}`}>
                {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>
          </div>

          <div className="order-actions">
            {order.status === 'pending' && (
              <button onClick={handleCancelOrder} className="cancel-btn">
                Hủy đơn hàng
              </button>
            )}
            {order.status === 'delivered' && (
              <button className="reorder-btn">
                Đặt lại đơn hàng
              </button>
            )}
            <button className="print-btn">
              In hóa đơn
            </button>
          </div>
        </div>
      </div>

      {order.trackingHistory && order.trackingHistory.length > 0 && (
        <div className="tracking-section">
          <h3>Lịch sử đơn hàng</h3>
          <div className="tracking-timeline">
            {order.trackingHistory.map((track, index) => (
              <div key={index} className="tracking-item">
                <div className="tracking-dot"></div>
                <div className="tracking-content">
                  <div className="tracking-status">{track.status}</div>
                  <div className="tracking-date">{formatDate(track.date)}</div>
                  <div className="tracking-description">{track.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
