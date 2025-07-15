import React, { useState, useEffect, useCallback } from 'react';
import OrderDetailModal from '../../components/OrderDetailModal/OrderDetailModal';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { toast } from 'react-toastify';
import './Orders.css';
import './Orders-pagination.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState({}); // { orderId: [items] }
  const [expandedOrders, setExpandedOrders] = useState({}); // { orderId: true/false }
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      // Chuyển filter sang status enum backend
      let statusParam = '';
      if (filter !== 'all') {
        switch (filter) {
          case 'pending': statusParam = 'PENDING'; break;
          case 'confirmed': statusParam = 'CONFIRMED'; break;
          case 'shipping': statusParam = 'SHIPPING'; break;
          case 'delivered': statusParam = 'DELIVERED'; break;
          case 'cancelled': statusParam = 'CANCELLED'; break;
          case 'completed': statusParam = 'COMPLETED'; break;
          default: statusParam = 'all';
        }
      }
      const response = await orderService.getMyOrders(page, 5, statusParam);
      setOrders(response?.data?.content || []);
      setCurrentPage(response?.data?.currentPage || 1);
      setTotalPages(response?.data?.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [filter]); // Dependency array for useCallback includes filter

  useEffect(() => {
    // The fetchOrders is already updated to handle page and statusParam from its own closure and arguments.
    // The statusParam logic here is redundant with the one in fetchOrders.
    // We can simplify this useEffect to just call fetchOrders with currentPage.
    fetchOrders(currentPage);
  }, [fetchOrders, currentPage]); // Dependencies are fetchOrders and currentPage

  // Fetch order details for each order
  useEffect(() => {
    const fetchDetails = async () => {
      const details = {};
      await Promise.all(orders.map(async (order) => {
        try {
          const res = await orderService.getOrderDetail(order.id);
          details[order.id] = res?.data || [];
        } catch (e) {
          details[order.id] = [];
        }
      }));
      setOrderDetails(details);
    };
    if (orders.length > 0) fetchDetails();
  }, [orders]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#ffa500';
      case 'CONFIRMED':
        return '#2196f3';
      case 'SHIPPED':
        return '#9c27b0';
      case 'DELIVERED':
        return '#4caf50';
      case 'CANCELLED':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'SHIPPING':
        return 'Đang giao';
      case 'DELIVERED':
        return 'Đã giao';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'COMPLETED':
        return 'Đã hoàn thành';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ' ' + date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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
        fetchOrders(currentPage);
      } catch (error) {
        toast.error('Không thể hủy đơn hàng: ' + error.message);
      }
    }
  };

  // Không cần lọc phía client nữa, đã lọc qua API
  const filteredOrders = orders;

  // Function to handle filter change and reset page to 1
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to page 1 every time filter changes
  };

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
    <>
      <div className="orders-container">
        <div className="orders-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            Tất cả
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => handleFilterChange('pending')}
          >
            Chờ xử lý
          </button>
          <button
            className={`filter-btn ${filter === 'shipping' ? 'active' : ''}`}
            onClick={() => handleFilterChange('shipping')}
          >
            Đang giao
          </button>
          <button
            className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
            onClick={() => handleFilterChange('delivered')}
          >
            Đã giao
          </button>
          <button
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => handleFilterChange('cancelled')}
          >
            Đã hủy
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => handleFilterChange('completed')}
          >
            Đã hoàn thành
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
                  {orderDetails[order.id] && orderDetails[order.id].length > 0 && (
                    <>
                      <table className="order-items-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ border: 'none' }}>
                            <th style={{ textAlign: 'left', fontWeight: 'bold', padding: '4px 8px' }}>Sản phẩm</th>
                            <th style={{ textAlign: 'left', fontWeight: 'bold', padding: '4px 8px' }}>Số lượng</th>
                            <th style={{ textAlign: 'left', fontWeight: 'bold', padding: '4px 8px' }}>Đơn giá</th>
                            <th style={{ textAlign: 'left', fontWeight: 'bold', padding: '4px 8px' }}>Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(expandedOrders[order.id]
                            ? orderDetails[order.id]
                            : [orderDetails[order.id][0]]
                          ).map(item => (
                            <tr key={item.id} style={{ border: 'none' }}>
                              <td style={{ padding: '4px 8px', verticalAlign: 'middle' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <img
                                    src={item.product.thumbnailUrl || '/api/placeholder/60/60'}
                                    alt={item.product.title}
                                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                                  />
                                  <span>{item.product.title}</span>
                                </div>
                              </td>
                              <td style={{ padding: '4px 8px' }}>{item.quantity}</td>
                              <td style={{ padding: '4px 8px' }}>{formatCurrency(item.priceAtOrder ?? item.price)}</td>
                              <td style={{ padding: '4px 8px' }}>{formatCurrency((item.priceAtOrder ?? item.price) * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {orderDetails[order.id].length > 1 && (
                        <button
                          className="toggle-items-btn"
                          onClick={() => setExpandedOrders(prev => ({
                            ...prev,
                            [order.id]: !prev[order.id]
                          }))}
                          style={{ marginTop: 8 }}
                        >
                          {expandedOrders[order.id] ? 'Thu gọn' : `Xem thêm (${orderDetails[order.id].length - 1} sản phẩm)`}
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <strong>Tổng tiền: {formatCurrency(order.totalPrice ?? order.total)}</strong>
                  </div>
                  <div className="order-actions">
                    <button
                      className="view-btn"
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setShowDetailModal(true);
                      }}
                    >
                      Xem chi tiết
                    </button>
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="cancel-btn"
                      >
                        Hủy đơn
                      </button>
                    )}
                    {order.status === 'DELIVERED' && (
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

        {/* Pagination Controls */}
        <div className="orders-pagination">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            Đầu
          </button>
          <button
            className="pagination-btn"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            «
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-btn${page === currentPage ? ' active' : ''}`}
              onClick={() => setCurrentPage(page)}
              disabled={page === currentPage}
            >
              {page}
            </button>
          ))}
          <button
            className="pagination-btn"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            »
          </button>
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            Cuối
          </button>
        </div>
      </div>
    {showDetailModal && (
      <OrderDetailModal
        order={orders.find(o => o.id === selectedOrderId)}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    )}
    </>
  );
};

export default Orders;