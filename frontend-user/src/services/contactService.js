import api from './publicApi';

export const contactService = {
    sendContact: async(contactData) => {
        const response = await api.post('/contacts', contactData);
        return response.data;
    }
}