import api from '../config/api';
import { ENDPOINTS } from '../config/constants';
import { apiUtils } from '../utils/apiUtils';

class OrderService {
    /**
     * Get all orders (admin)
     * @param {Object} params - Query parameters
     * @returns {Promise<ApiResponse>}
     */
    async getOrders(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.ORDERS.GET_ALL, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Get order details
     * @param {string|number} id - Order ID
     * @returns {Promise<ApiResponse>}
     */
    async getOrderDetails(id) {
        try {
            const response = await api.get(ENDPOINTS.ORDERS.GET_DETAILS(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }



    /**
     * Update order status
     * @param {string|number} id - Order ID
     * @param {string} status - New status
     * @returns {Promise<ApiResponse>}
     */
    async updateOrderStatus(id, status) {
        try {
            const response = await api.put(ENDPOINTS.ORDERS.UPDATE_STATUS, null, {
                params: { status }
            });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Update payment status
     * @param {string|number} id - Order ID
     * @param {string} status - New payment status
     * @returns {Promise<ApiResponse>}
     */
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