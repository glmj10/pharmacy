import api from '../config/api';
import { ENDPOINTS } from '../config/constants';
import { apiUtils } from '../utils/apiUtils';

class BrandService {
    async getBrands(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.BRANDS.GET_ALL, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getAllBrands() {
        try {
            const response = await api.get(ENDPOINTS.BRANDS.GET_ALL);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getBrandById(id) {
        try {
            const response = await api.get(ENDPOINTS.BRANDS.GET_BY_ID(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async createBrand(brandData) {
        try {
            const response = await api.post(ENDPOINTS.BRANDS.CREATE, brandData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async updateBrand(id, brandData) {
        try {
            const response = await api.put(ENDPOINTS.BRANDS.UPDATE(id), brandData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

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
