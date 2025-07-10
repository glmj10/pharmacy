import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { toast } from 'react-toastify';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        await orderService.cancelOrder(orderId);
        toast.success('Đã hủy đơn hàng thành công!');
        fetchOrders();
      } catch (error) {
        toast.error('Không thể hủy đơn hàng: ' + error.message);
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>Đơn hàng của tôi</h1>
        <p>Theo dõi và quản lý các đơn hàng của bạn</p>
      </div>

      <div className="orders-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Chờ xử lý
        </button>
        <button
          className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Đã xác nhận
        </button>
        <button
          className={`filter-btn ${filter === 'shipped' ? 'active' : ''}`}
          onClick={() => setFilter('shipped')}
        >
          Đang giao
        </button>
        <button
          className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilter('delivered')}
        >
          Đã giao
        </button>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h3>Không có đơn hàng nào</h3>
            <p>Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
            <Link to="/products" className="shop-btn">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Đơn hàng #{order.id}</h3>
                  <p className="order-date">Ngày đặt: {formatDate(order.createdAt)}</p>
                </div>
                <div className="order-status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              <div className="order-items">
                {order.items && order.items.slice(0, 3).map(item => (
                  <div key={item.id} className="order-item">
                    <img
                      src={item.product.imageUrl || '/api/placeholder/60/60'}
                      alt={item.product.name}
                      className="item-image"
                    />
                    <div className="item-details">
                      <h4>{item.product.name}</h4>
                      <p>Số lượng: {item.quantity}</p>
                      <p className="item-price">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))}
                {order.items && order.items.length > 3 && (
                  <div className="more-items">
                    +{order.items.length - 3} sản phẩm khác
                  </div>
                )}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <strong>Tổng tiền: {formatCurrency(order.total)}</strong>
                </div>
                <div className="order-actions">
                  <Link to={`/orders/${order.id}`} className="view-btn">
                    Xem chi tiết
                  </Link>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="cancel-btn"
                    >
                      Hủy đơn
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button className="reorder-btn">
                      Đặt lại
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
