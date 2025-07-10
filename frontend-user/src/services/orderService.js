import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  getOrderDetail: async (orderId) => {
    const response = await api.get(`/orders/detail/${orderId}`);
    return response.data;
  }
};
