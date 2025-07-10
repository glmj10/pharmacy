import api from './api';

export const cartService = {
  getCart: async () => {
    const response = await api.get('/carts');
    return response.data;
  },

  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/carts', {
      productId,
      quantity
    });
    return response.data;
  },

  updateCartItem: async (itemId, quantity) => {
    const response = await api.put(`/carts/item/${itemId}`, {
      quantity
    });
    return response.data;
  },

  removeFromCart: async (itemId) => {
    const response = await api.delete(`/carts/item/${itemId}`);
    return response.data;
  },

  updateCartItemStatus: async (itemId, status) => {
    const response = await api.patch(`/carts/item/status/${itemId}`, {
      status
    });
    return response.data;
  }
};
