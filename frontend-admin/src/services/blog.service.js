import api from '../config/api';
import { apiUtils } from '../utils/apiUtils';
import { ENDPOINTS } from '../config/constants';

class BlogService {
    async getBlogs(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.BLOG.GET_ALL, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
    
    async getBlogById(id) {
        try {
            const response = await api.get(ENDPOINTS.BLOG.GET_BY_ID(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getBlogBySlug(slug) {
        try {
            const response = await api.get(ENDPOINTS.BLOG.GET_BY_SLUG(slug));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async createBlog(blogData) {
        try {
            const response = await api.post(ENDPOINTS.BLOG.CREATE, blogData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async updateBlog(id, blogData) {
        try {
            const response = await api.put(ENDPOINTS.BLOG.UPDATE(id), blogData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async deleteBlog(id) {
        try {
            const response = await api.delete(ENDPOINTS.BLOG.DELETE(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
}

export default new BlogService();