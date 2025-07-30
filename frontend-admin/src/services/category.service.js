import api from '../config/api';
import { ENDPOINTS } from '../config/constants';
import { apiUtils } from '../utils/apiUtils';

class CategoryService {
    async getCategories() {
        try {
            const response = await api.get(ENDPOINTS.CATEGORIES.GET_ALL);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getBlogCategories() {
        try {
            const response = await api.get(ENDPOINTS.CATEGORIES.GET_ALL_BLOG_CATEGORIES);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getAllProductCategories() {
        try {
            const response = await api.get(ENDPOINTS.CATEGORIES.GET_ALL);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getCategoryById(id) {
        try {
            const response = await api.get(ENDPOINTS.CATEGORIES.GET_BY_ID(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async createCategory(categoryData, config = {}) {
        try {
            const response = await api.post(ENDPOINTS.CATEGORIES.CREATE, categoryData, config);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async updateCategory(id, categoryData, config = {}) {
        try {
            const response = await api.put(ENDPOINTS.CATEGORIES.UPDATE(id), categoryData, config);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async deleteCategory(id) {
        try {
            const response = await api.delete(`/categories/${id}`);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getAllCategories() {
        try {
            const response = await api.get(ENDPOINTS.CATEGORIES.GET_ALL);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
}

export default new CategoryService();
