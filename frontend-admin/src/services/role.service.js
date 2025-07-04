import api from '../config/api';
import { apiUtils } from '../utils/apiUtils';

class RoleService {
    /**
     * Get all roles
     * @returns {Promise<ApiResponse>}
     */
    async getAllRoles() {
        try {
            const response = await api.get('/roles');
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
}

export default new RoleService();
