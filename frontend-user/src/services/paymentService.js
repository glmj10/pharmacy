import api from './api';

export const paymentService = {
    paymentVNPAYReturn: async (params) => {
        const response = await api.get('/vnpay/return', { params });
        return response.data;
    }
}