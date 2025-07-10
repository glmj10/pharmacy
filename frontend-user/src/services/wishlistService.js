import api from './api';

export const wishlistService = {
  getWishlist: async () => {
    const response = await api.get('/wishlist/my-wishlist');
    return response.data;
  },

  addToWishlist: async (productId) => {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  },

  removeFromWishlist: async (wishlistId) => {
    const response = await api.delete(`/wishlist/remove/${wishlistId}`);
    return response.data;
  }
};
