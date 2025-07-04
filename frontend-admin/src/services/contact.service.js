import api from '../config/api';
import { ENDPOINTS } from '../config/constants';
import { apiUtils } from '../utils/apiUtils';

class ContactService {
    /**
     * Get all contacts (admin)
     * @param {Object} params - Query parameters
     * @returns {Promise<ApiResponse>}
     */
    async getContacts(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.CONTACTS.GET_ALL, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Get contact by ID
     * @param {string|number} id - Contact ID
     * @returns {Promise<ApiResponse>}
     */
    async getContactById(id) {
        try {
            const response = await api.get(`/contacts/${id}`);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Create new contact
     * @param {Object} contactData - Contact data
     * @returns {Promise<ApiResponse>}
     */
    async createContact(contactData) {
        try {
            const response = await api.post('/contacts', contactData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    /**
     * Update contact status
     * @param {string|number} id - Contact ID
     * @param {string} status - New status
     * @returns {Promise<ApiResponse>}
     */
    async updateContactStatus(id, status) {
        try {
            const response = await api.put(ENDPOINTS.CONTACTS.CHANGE_STATUS(id), null, {
                params: { status }
            });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
}

export default new ContactService();
