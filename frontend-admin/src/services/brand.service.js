import api from '../config/api';
import { apiUtils } from '../utils/apiUtils';

class BrandService {
    /**
     * Get all brands
     * @returns {Promise<ApiResponse>}
     */
    async getBrands() {
        try {
            const response = await api.get('/brands');
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
            const response = await api.get(`/brands/${id}`);
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
            const response = await api.post('/brands', brandData, {
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
     * Update brand
     * @param {string|number} id - Brand ID
     * @param {FormData} brandData - Brand form data
     * @returns {Promise<ApiResponse>}
     */
    async updateBrand(id, brandData) {
        try {
            const response = await api.put(`/brands/${id}`, brandData, {
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
     * Delete brand
     * @param {string|number} id - Brand ID
     * @returns {Promise<ApiResponse>}
     */
    async deleteBrand(id) {
        try {
            const response = await api.delete(`/brands/${id}`);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
}

export default new BrandService();
