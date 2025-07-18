import api from './api';


export const blogService = {
    getBlogs: async (params) => {
        const response = await api.get('/posts', { params });
        return response.data;
    },

    getBlogsBySlug: async (slug) => {
        const response = await api.get(`/posts/${slug}`);
        return response.data; 
    },
}

