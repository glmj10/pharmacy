import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false); // State để hiển thị modal xác nhận hủy
  const [showRefundInfo, setShowRefundInfo] = useState(false); // State để hiển thị modal thông báo hoàn tiền

  // Use a ref to store IDs of orders whose details have been fetched
  // This helps prevent redundant API calls for order details
  const fetchedDetailIds = useRef(new Set());

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Helper function to get status text
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

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#ffa500'; // Orange
      case 'CONFIRMED':
        return '#2196f3'; // Blue
      case 'SHIPPING':
        return '#9c27b0'; // Purple
      case 'DELIVERED':
        return '#4caf50'; // Green
      case 'CANCELLED':
        return '#f44336'; // Red
      case 'COMPLETED':
        return '#28a745'; // Darker green
      default:
        return '#666'; // Gray
    }
  };

  const fetchOrders = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      let statusParam = '';
      if (filter !== 'all') {
        switch (filter) {
          case 'pending': statusParam = 'PENDING'; break;
          case 'confirmed': statusParam = 'CONFIRMED'; break;
          case 'shipping': statusParam = 'SHIPPING'; break;
          case 'delivered': statusParam = 'DELIVERED'; break;
          case 'cancelled': statusParam = 'CANCELLED'; break;
          case 'completed': statusParam = 'COMPLETED'; break;
          default: break; // If filter is not one of the cases, no statusParam is sent
        }
      }

      const response = await orderService.getMyOrders(page, 5, statusParam);
      const fetchedOrders = response?.data?.content || [];
      setOrders(fetchedOrders);
      setCurrentPage(response?.data?.currentPage || 1);
      setTotalPages(response?.data?.totalPages || 1);

      // Fetch details for orders that are newly loaded or not yet in state
      const newDetailsToFetch = fetchedOrders.filter(order =>
        !fetchedDetailIds.current.has(order.id)
      );

      if (newDetailsToFetch.length > 0) {
        const tempOrderDetails = {};
        await Promise.all(newDetailsToFetch.map(async (order) => {
          try {
            const res = await orderService.getOrderDetail(order.id);
            tempOrderDetails[order.id] = res?.data?.items || [];
            fetchedDetailIds.current.add(order.id); // Mark as fetched
          } catch (e) {
            console.error(`Lỗi khi lấy chi tiết đơn hàng ${order.id}:`, e);
            tempOrderDetails[order.id] = []; // Ensure it's an empty array on error
          }
        }));
        setOrderDetails(prev => ({ ...prev, ...tempOrderDetails }));
      }

    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [filter]); // fetchOrders depends on 'filter', so it re-runs when filter changes

  useEffect(() => {
    // This effect runs when currentPage changes or fetchOrders itself changes (due to filter change)
    fetchOrders(currentPage);
  }, [fetchOrders, currentPage]);

  const handleCancelOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelConfirm(true); // Hiển thị modal xác nhận hủy
  };

  // Function to handle filter change and reset page to 1
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to page 1 every time filter changes
    fetchedDetailIds.current.clear(); // Clear the cache of fetched details when filter changes
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
    <> {/* Use React.Fragment for top-level elements */}
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
            className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => handleFilterChange('confirmed')}
          >
            Đã xác nhận
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
          {orders.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-icon">📦</div>
              <h3>Không có đơn hàng nào</h3>
              <p>Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
              <Link to="/products" className="shop-btn">
                Mua sắm ngay
              </Link>
            </div>
          ) : (
            orders.map(order => (
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
                  {/* Render order items if details are available and not empty */}
                  {orderDetails[order.id] && orderDetails[order.id].length > 0 ? (
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
                            : [orderDetails[order.id][0]] // Show only the first item if not expanded
                          ).map(item => (
                            <tr key={item.id} style={{ border: 'none' }}>
                              <td style={{ padding: '4px 8px', verticalAlign: 'middle' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <img
                                    src={item.product?.thumbnailUrl || '/api/placeholder/60/60'}
                                    alt={item.product?.title}
                                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                                  />
                                  <span>{item.product?.title}</span>
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
                  ) : (
                    <p>Đang tải chi tiết sản phẩm...</p> // Show loading if details are not yet available
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
      {/* Modal xác nhận hủy đơn */}
      {showCancelConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận hủy đơn hàng</h3>
            <p>Bạn có chắc chắn muốn hủy đơn hàng #{selectedOrderId}?</p>
            <div className='modal-actions'>
              <button className="btn btn-danger" onClick={async () => {
                try {
                  await orderService.cancelOrder(selectedOrderId);
                  toast.success('Đã hủy đơn hàng thành công!');
                  setShowCancelConfirm(false);
                  setShowRefundInfo(true); // Hiển thị modal thông báo hoàn tiền sau khi hủy thành công
                  fetchedDetailIds.current.delete(selectedOrderId); // Invalidate cached details for the cancelled order
                  fetchOrders(currentPage); // Tải lại danh sách đơn hàng để cập nhật trạng thái
                } catch (error) {
                  toast.error('Không thể hủy đơn hàng: ' + (error.response?.data?.message || error.message));
                  setShowCancelConfirm(false);
                }
              }}>Xác nhận hủy</button>
              <button className="btn btn-secondary" onClick={() => setShowCancelConfirm(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
      {showRefundInfo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Thông báo hoàn tiền</h3>
            <p>Đối với các đơn hàng đã thanh toán, vui lòng liên hệ với nhà thuốc qua hotline <strong>1800-1234</strong> để được hỗ trợ hoàn tiền đơn hàng #{selectedOrderId}.</p>
            <button className="btn btn-primary" onClick={() => setShowRefundInfo(false)}>Đã hiểu</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;