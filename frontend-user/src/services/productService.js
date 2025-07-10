import api from './api';

export const productService = {
  getAllProducts: async (params = {}) => {
    // Backend expects pageIndex, pageSize, title, categorySlug, etc.
    const backendParams = {
      pageIndex: params.pageIndex || params.page || 1,
      pageSize: params.pageSize || params.limit || 10,
      title: params.title || params.search,
      categorySlug: params.categorySlug,
      brandSlug: params.brandSlug,
      priceFrom: params.priceFrom,
      priceTo: params.priceTo,
      isAscending: params.isAscending
    };

    // Remove undefined/empty values
    Object.keys(backendParams).forEach(key => {
      if (backendParams[key] === undefined || backendParams[key] === '') {
        delete backendParams[key];
      }
    });

    const response = await api.get('/products', { params: backendParams });
    return response.data;
  },

  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },

  searchProducts: async (query, params = {}) => {
    const searchParams = {
      pageIndex: params.page || 1,
      pageSize: params.limit || 10,
      title: query,
      ...params
    };
    
    const response = await api.get('/products', { params: searchParams });
    return response.data;
  },

  getProductsByCategory: async (categorySlug, params = {}) => {
    const searchParams = {
      pageIndex: params.page || 1,
      pageSize: params.limit || 10,
      categorySlug: categorySlug,
      ...params
    };
    
    const response = await api.get('/products', { params: searchParams });
    return response.data;
  }
};
