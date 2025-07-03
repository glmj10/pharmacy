import api from '../config/api';
import { apiUtils } from '../utils/apiUtils';

class CategoryService {
    /**
     * Get all categories
     * @returns {Promise<ApiResponse>}
     */
    async getCategories() {
        try {
            const response = await api.get('/categories');
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Get categories by parent slug
     * @param {string} parentSlug - Parent category slug
     * @returns {Promise<ApiResponse>}
     */
    async getCategoriesByParent(parentSlug) {
        try {
            const response = await api.get(`/categories/parent/${parentSlug}`);
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
            const response = await api.get(`/categories/${id}`);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Create new category
     * @param {FormData} categoryData - Category form data
     * @returns {Promise<ApiResponse>}
     */
    async createCategory(categoryData) {
        try {
            const response = await api.post('/categories', categoryData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Update category
     * @param {string|number} id - Category ID
     * @param {FormData} categoryData - Category form data
     * @returns {Promise<ApiResponse>}
     */
    async updateCategory(id, categoryData) {
        try {
            const response = await api.put(`/categories/${id}`, categoryData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
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
