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
            const response = await api.get(`/blogs/${id}`);
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
            const response = await api.get(`/blogs/slug/${slug}`);
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
            const response = await api.post('/blogs', blogData, {
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
     * Update blog
     * @param {string|number} id - Blog ID
     * @param {FormData} blogData - Blog form data
     * @returns {Promise<ApiResponse>}
     */
    async updateBlog(id, blogData) {
        try {
            const response = await api.put(`/blogs/${id}`, blogData, {
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
     * Update blog status
     * @param {string|number} id - Blog ID
     * @param {boolean} status - New status
     * @returns {Promise<ApiResponse>}
     */
    async updateBlogStatus(id, status) {
        try {
            const response = await api.put(`/blogs/status/${id}`, status);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Delete blog
     * @param {string|number} id - Blog ID
     * @returns {Promise<ApiResponse>}
     */
    async deleteBlog(id) {
        try {
            const response = await api.delete(`/blogs/${id}`);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
}

export default new BlogService();