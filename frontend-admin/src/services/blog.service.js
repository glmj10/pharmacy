import api from '../config/api';
import { apiUtils } from '../utils/apiUtils';
import { ENDPOINTS } from '../config/constants';

class BlogService {
    /**
     * Get all active blogs (public)
     * @param {Object} params - Query parameters
     * @returns {Promise<ApiResponse>}
     */
    async getBlogs(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.BLOG.GET_ALL, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
    
    /**
     * Get blog by ID
     * @param {string|number} id - Blog ID
     * @returns {Promise<ApiResponse>}
     */
    async getBlogById(id) {
        try {
            const response = await api.get(ENDPOINTS.BLOG.GET_BY_ID(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Get blog by slug
     * @param {string} slug - Blog slug
     * @returns {Promise<ApiResponse>}
     */
    async getBlogBySlug(slug) {
        try {
            const response = await api.get(ENDPOINTS.BLOG.GET_BY_SLUG(slug));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Create new blog
     * @param {FormData} blogData - Blog form data
     * @returns {Promise<ApiResponse>}
     */
    async createBlog(blogData) {
        try {
            const response = await api.post(ENDPOINTS.BLOG.CREATE, blogData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Update blog
     * @param {string|number} id - Blog ID
     * @param {FormData} blogData - Blog form data
     * @returns {Promise<ApiResponse>}
     */
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