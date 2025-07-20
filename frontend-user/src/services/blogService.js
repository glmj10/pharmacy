import api from './api';


export const blogService = {
    getBlogs: async (params) => {
        const response = await api.get('/blogs', { params });
        return response.data;
    },

    getBlogsBySlug: async (slug) => {
        const response = await api.get(`/blogs/slug/${slug}`);
        return response.data; 
    },
}

