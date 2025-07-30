import api from '../config/api';
import { ENDPOINTS } from '../config/constants';
import { apiUtils } from '../utils/apiUtils';

class ProductService {
    async getProductsCMS(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.PRODUCTS.GET_CMS, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getProductById(id) {
        try {
            const response = await api.get(ENDPOINTS.PRODUCTS.GET_BY_ID(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

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