import api from '../config/api';
import { ENDPOINTS } from '../config/constants';
import { apiUtils } from '../utils/apiUtils';

class ContactService {
    async getContacts(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.CONTACTS.GET_ALL, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getContactById(id) {
        try {
            const response = await api.get(`/contacts/${id}`);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async createContact(contactData) {
        try {
            const response = await api.post('/contacts', contactData);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

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
