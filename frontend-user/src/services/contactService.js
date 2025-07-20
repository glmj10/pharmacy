import api from './api';

export const contactService = {
    sendContact: async(contactData) => {
        const response = await api.post('/contacts', contactData);
        return response.data;
    }
}