import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

class BrandService {
  async getAllBrands() {
    try {
      const response = await axios.get(`${API_BASE_URL}/brands/customer/public`);
      return response.data; 
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  }
}

export default new BrandService();
