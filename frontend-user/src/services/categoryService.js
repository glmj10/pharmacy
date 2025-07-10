import api from './api';

export const categoryService = {
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data; // Return response.data to match API structure
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data; // Return response.data to match API structure
  },

  getCategoriesByParentSlug: async (parentSlug) => {
    const response = await api.get(`/categories/parent/${parentSlug}`);
    return response.data; // Return response.data with parent and children structure
  }
};
