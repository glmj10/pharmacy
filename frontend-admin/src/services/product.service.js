import api from '../config/api';
import { ENDPOINTS } from '../config/constants';
import { apiUtils } from '../utils/apiUtils';

class ProductService {
    /**
     * Get all products for CMS (admin/staff)
     * @param {Object} params - Query parameters
     * @returns {Promise<ApiResponse>}
     */
    async getProductsCMS(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.PRODUCTS.GET_CMS, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Get product by ID (admin/staff)
     * @param {string|number} id - Product ID
     * @returns {Promise<ApiResponse>}
     */
    async getProductById(id) {
        try {
            const response = await api.get(ENDPOINTS.PRODUCTS.GET_BY_ID(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Create new product (admin/staff)
     * @param {FormData} formData - Product form data with files
     * @returns {Promise<ApiResponse>}
     */
    async createProduct(formData) {
        try {
            const response = await api.post(ENDPOINTS.PRODUCTS.CREATE, formData, {
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
     * Update product (admin/staff)
     * @param {string|number} id - Product ID
     * @param {FormData} formData - Updated product form data
     * @returns {Promise<ApiResponse>}
     */
    async updateProduct(id, formData) {
        try {
            const response = await api.put(ENDPOINTS.PRODUCTS.UPDATE(id), formData, {
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
     * Update product status (admin/staff)
     * @param {string|number} id - Product ID
     * @param {boolean} active - New active status
     * @returns {Promise<ApiResponse>}
     */
    async updateProductStatus(id, active) {
        try {
            const response = await api.put(ENDPOINTS.PRODUCTS.UPDATE_STATUS(id), active, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Delete product (admin/staff)
     * @param {string|number} id - Product ID
     * @returns {Promise<ApiResponse>}
     */
    async deleteProduct(id) {
        try {
            const response = await api.delete(ENDPOINTS.PRODUCTS.DELETE(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
}

export default new ProductService();