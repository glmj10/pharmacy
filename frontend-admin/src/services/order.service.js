import api from '../config/api';
import { apiUtils } from '../utils/apiUtils';

class OrderService {
    /**
     * Get all orders (admin)
     * @param {Object} params - Query parameters
     * @returns {Promise<ApiResponse>}
     */
    async getOrders(params = {}) {
        try {
            const response = await api.get('/orders', { params });
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
            const response = await api.get(`/orders/detail/${id}`);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Get current user's orders
     * @returns {Promise<ApiResponse>}
     */
    async getMyOrders() {
        try {
            const response = await api.get('/orders/my-orders');
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Create new order
     * @param {Object} orderData - Order data
     * @returns {Promise<ApiResponse>}
     */
    async createOrder(orderData) {
        try {
            const response = await api.post('/orders', orderData);
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
            const response = await api.put(`/orders/status/${id}`, null, {
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
            const response = await api.put(`/orders/payment-status/${id}`, null, {
                params: { status }
            });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
}

export default new OrderService();