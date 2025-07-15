import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async (pageIndex = 1, pageSize = 5, status) => {
    const response = await api.get(`/orders/my-orders?pageIndex=${pageIndex}&pageSize=${pageSize}&status=${status}`);
    return response.data;
  },

  getOrderDetail: async (orderId) => {
    const response = await api.get(`/orders/detail/${orderId}`);
    return response.data;
  }
};
