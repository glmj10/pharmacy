import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/orderService';
import './OrderDetailModal.css';

const OrderDetailModal = ({ order, isOpen, onClose }) => {
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && order?.id) {
      setLoading(true);
      orderService.getOrderDetail(order.id)
        .then(data => {
          // Nếu data.data là mảng, gộp với order
          let detail;
          if (Array.isArray(data?.data)) {
            detail = { ...order, items: data.data };
          } else {
            detail = data?.data || order;
          }
          setOrderDetail(detail);
          setError(null);
        })
        .catch(err => {
          setError('Không thể tải chi tiết đơn hàng');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, order]);

  if (!isOpen) return null;

  return (
    <div className="order-detail-modal-overlay" onClick={onClose}>
      <div className="order-detail-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Chi tiết đơn hàng #{order?.id}</h2>
        {loading ? (
          <div className="modal-loading">Đang tải...</div>
        ) : error ? (
          <div className="modal-error">{error}</div>
        ) : orderDetail ? (
          <>
            <div className="order-detail-content">
              <div><strong>Khách hàng:</strong> {orderDetail.customerName || order?.customerName}</div>
              <div><strong>Địa chỉ:</strong> {orderDetail.customerAddress || order?.customerAddress}</div>
              <div><strong>Số điện thoại:</strong> {orderDetail.customerPhoneNumber || order?.customerPhoneNumber}</div>
              <div><strong>Ghi chú:</strong> {orderDetail.note || order?.note}</div>
              <div><strong>Phương thức thanh toán:</strong> {orderDetail.paymentMethod || order?.paymentMethod}</div>
              <div><strong>Trạng thái thanh toán:</strong> {
                getPaymentStatusText(orderDetail.paymentStatus || order?.paymentStatus)
              }</div>
              <div><strong>Trạng thái đơn hàng:</strong> {
                order.getStatusText
                  ? order.getStatusText(orderDetail.status || order?.status)
                  : getStatusText(orderDetail.status || order?.status)
              }</div>
              <div><strong>Ngày đặt:</strong> {orderDetail.createdAt || order?.createdAt}</div>
              <div><strong>Tổng tiền:</strong> {orderDetail.totalPrice || order?.totalPrice}</div>
            </div>
            <h3 style={{ marginTop: 24 }}>Sản phẩm</h3>
            {orderDetail.items && orderDetail.items.length > 0 ? (
              <div style={{ width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
                  <thead>
                    <tr style={{ border: 'none' }}>
                      <th style={{ textAlign: 'left', fontWeight: 'bold', padding: '12px 16px', fontSize: '1rem' }}>Sản phẩm</th>
                      <th style={{ textAlign: 'center', fontWeight: 'bold', padding: '12px 16px', fontSize: '1rem' }}>Số lượng</th>
                      <th style={{ textAlign: 'center', fontWeight: 'bold', padding: '12px 16px', fontSize: '1rem' }}>Đơn giá</th>
                      <th style={{ textAlign: 'center', fontWeight: 'bold', padding: '12px 16px', fontSize: '1rem' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetail.items.map(item => (
                      <tr key={item.id} style={{ background: '#f7f9fa', borderRadius: 8 }}>
                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <img
                              src={item.product?.thumbnailUrl || '/api/placeholder/80/80'}
                              alt={item.product?.title || 'Sản phẩm'}
                              style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, background: '#eee' }}
                            />
                            <span style={{ fontWeight: 500, fontSize: '1.05rem', color: '#222' }}>{item.product?.title || 'Sản phẩm'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '1rem' }}>{item.quantity}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '1rem', color: '#1976d2', fontWeight: 500 }}>{item.priceAtOrder ?? item.price}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '1rem', color: '#388e3c', fontWeight: 600 }}>{(item.priceAtOrder ?? item.price) * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>Không có sản phẩm nào trong đơn hàng.</div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

// Thêm hàm getStatusText dự phòng nếu không truyền từ order
function getStatusText(status) {
  switch (status) {
    case 'PENDING':
      return 'Chờ xử lý';
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'SHIPPING':
    case 'SHIPPED':
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
}

// Thêm hàm chuyển đổi trạng thái thanh toán
function getPaymentStatusText(status) {
  switch (status) {
    case 'PENDING':
      return 'Chờ thanh toán';
    case 'COMPLETED':
      return 'Đã thanh toán';
    case 'FAILED':
      return 'Thanh toán thất bại';
    default:
      return status;
  }
}

export default OrderDetailModal;
