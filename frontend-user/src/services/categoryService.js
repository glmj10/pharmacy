import api from './publicApi';

export const categoryService = {
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data; 
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  getCategoriesByParentSlug: async (parentSlug) => {
    const response = await api.get(`/categories/parent/${parentSlug}`);
    return response.data; 
  }
};
