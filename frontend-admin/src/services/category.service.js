import api from '../config/api';
import { ENDPOINTS } from '../config/constants';
import { apiUtils } from '../utils/apiUtils';

class CategoryService {
    /**
     * Get all categories
     * @returns {Promise<ApiResponse>}
     */
    async getCategories() {
        try {
            const response = await api.get(ENDPOINTS.CATEGORIES.GET_ALL);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Get all blog categories
     * @returns {Promise<ApiResponse>}
     */
    async getBlogCategories() {
        try {
            const response = await api.get(ENDPOINTS.CATEGORIES.GET_ALL_BLOG_CATEGORIES);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Get category by ID
     * @param {string|number} id - Category ID
     * @returns {Promise<ApiResponse>}
     */
    async getCategoryById(id) {
        try {
            const response = await api.get(ENDPOINTS.CATEGORIES.GET_BY_ID(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Create new category
     * @param {FormData} categoryData - Category form data
     * @param {Object} config - Axios config options
     * @returns {Promise<ApiResponse>}
     */
    async createCategory(categoryData, config = {}) {
        try {
            const response = await api.post(ENDPOINTS.CATEGORIES.CREATE, categoryData, config);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Update category
     * @param {string|number} id - Category ID
     * @param {FormData} categoryData - Category form data
     * @param {Object} config - Axios config options
     * @returns {Promise<ApiResponse>}
     */
    async updateCategory(id, categoryData, config = {}) {
        try {
            const response = await api.put(ENDPOINTS.CATEGORIES.UPDATE(id), categoryData, config);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Delete category
     * @param {string|number} id - Category ID
     * @returns {Promise<ApiResponse>}
     */
    async deleteCategory(id) {
        try {
            const response = await api.delete(`/categories/${id}`);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
}

export default new CategoryService();
