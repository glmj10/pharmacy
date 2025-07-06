import api from '../config/api';
import { ENDPOINTS } from '../config/constants';
import { apiUtils } from '../utils/apiUtils';

class BrandService {
    /**
     * Get all brands
     * @param {Object} params - Query parameters for pagination and filtering
     * @returns {Promise<ApiResponse>}
     */
    async getBrands(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.BRANDS.GET_ALL, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Get all brands without pagination
     * @returns {Promise<ApiResponse>}
     */
    async getAllBrands() {
        try {
            const response = await api.get(ENDPOINTS.BRANDS.GET_ALL);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Get brand by ID
     * @param {string|number} id - Brand ID
     * @returns {Promise<ApiResponse>}
     */
    async getBrandById(id) {
        try {
            const response = await api.get(ENDPOINTS.BRANDS.GET_BY_ID(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Create new brand
     * @param {FormData} brandData - Brand form data
     * @returns {Promise<ApiResponse>}
     */
    async createBrand(brandData) {
        try {
            const response = await api.post(ENDPOINTS.BRANDS.CREATE, brandData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Update brand
     * @param {string|number} id - Brand ID
     * @param {FormData} brandData - Brand form data
     * @returns {Promise<ApiResponse>}
     */
    async updateBrand(id, brandData) {
        try {
            const response = await api.put(ENDPOINTS.BRANDS.UPDATE(id), brandData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Delete brand
     * @param {string|number} id - Brand ID
     * @returns {Promise<ApiResponse>}
     */
    async deleteBrand(id) {
        try {
            const response = await api.delete(ENDPOINTS.BRANDS.DELETE(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
}

export default new BrandService();
