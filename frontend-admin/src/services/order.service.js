import api from '../config/api';
import { ENDPOINTS } from '../config/constants';
import { apiUtils } from '../utils/apiUtils';

class OrderService {
    async getOrders(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.ORDERS.GET_ALL, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getOrderDetails(id) {
        try {
            const response = await api.get(ENDPOINTS.ORDERS.GET_DETAILS(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async updateOrderStatus(id, status) {
        try {
            const response = await api.put(ENDPOINTS.ORDERS.UPDATE_STATUS(id), null, {
                params: { status }
            });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async updatePaymentStatus(id, status) {
        try {
            const response = await api.put(ENDPOINTS.ORDERS.UPDATE_PAYMENT_STATUS(id), null, {
                params: { status }
            });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
}

export default new OrderService();