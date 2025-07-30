import api from '../config/api';
import { ENDPOINTS } from '../config/constants';
import { apiUtils } from '../utils/apiUtils';

class DashboardService {
    async getDashboardStats() {
        try {
            const [productResponse, orderResponse, userResponse, revenueResponse] = await Promise.all([
                api.get('/products/statistic/total').catch(err => {
                    console.error('Product total API error:', err);
                    throw err;
                }),
                api.get('/orders/statistic/total').catch(err => {
                    console.error('Order total API error:', err);
                    throw err;
                }),
                api.get('/users/statistic/total').catch(err => {
                    console.error('User total API error:', err);
                    throw err;
                }),
                api.get('/orders/statistic/allRevenue').catch(err => {
                    console.error('Revenue API error:', err);
                    throw err;
                })
            ]);
            
            const totalProducts = productResponse.data?.data || 0;
            const totalOrders = orderResponse.data?.data || 0;
            const totalUsers = userResponse.data?.data || 0;
            const totalRevenue = revenueResponse.data?.data || 0;

            return {
                success: true,
                data: {
                    totalProducts,
                    totalOrders,
                    totalUsers,
                    totalRevenue
                }
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            return {
                success: false,
                data: {
                    totalProducts: 0,
                    totalOrders: 0,
                    totalUsers: 0,
                    totalRevenue: 0
                }
            };
        }
    }

    async getRecentOrders() {
        try {
            const response = await api.get('/orders/statistic/newest');
            
            const orders = response.data?.data || [];
            
            const formattedOrders = orders.map(order => ({
                id: order.id,
                customerName: order.customerName || 'Khách hàng',
                customerPhone: order.customerPhoneNumber || '',
                totalAmount: order.totalPrice || 0,
                status: order.status || 'PENDING',
                paymentStatus: order.paymentStatus || 'PENDING',
                createdAt: order.createdAt || new Date().toISOString(),
            }));

            return {
                success: true,
                data: formattedOrders
            };
        } catch (error) {
            console.error('Error fetching recent orders:', error);
            return {
                success: false,
                data: []
            };
        }
    }

    async getTopProducts(limit = 5) {
        try {
            const response = await api.get(ENDPOINTS.PRODUCTS.GET_CMS, { 
                params: { 
                    pageIndex: 1, 
                    pageSize: limit,
                    isActive: true
                } 
            });
            
            const products = response.data?.data?.content || [];
            
            return {
                success: true,
                data: products.map(product => ({
                    id: product.id,
                    title: product.title,
                    priceNew: product.priceNew,
                    quantity: product.quantity,
                    thumbnailUrl: product.thumbnailUrl,
                    active: product.active
                }))
            };
        } catch (error) {
            console.error('Error fetching top products:', error);
            return {
                success: false,
                data: []
            };
        }
    }

    async getLowStockProducts(threshold = 10, limit = 5) {
        try {

            const response = await api.get(ENDPOINTS.PRODUCTS.GET_CMS, { 
                params: { 
                    pageIndex: 1, 
                    pageSize: 50, 
                    isActive: true
                } 
            });
            
            const products = response.data?.data?.content || [];
            const lowStockProducts = products
                .filter(product => product.quantity <= threshold)
                .slice(0, limit);
            
            return {
                success: true,
                data: lowStockProducts.map(product => ({
                    id: product.id,
                    title: product.title,
                    quantity: product.quantity,
                    thumbnailUrl: product.thumbnailUrl
                }))
            };
        } catch (error) {
            console.error('Error fetching low stock products:', error);
            return {
                success: false,
                data: []
            };
        }
    }
}

export default new DashboardService();
