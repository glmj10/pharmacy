import axios from "axios";
import { API_CONFIG } from "./constants";
import { requestInterceptor, requestErrorInterceptor } from '../interceptors/request';
import { responseInterceptor, responseErrorInterceptor } from '../interceptors/response';


const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
});

api.interceptors.request.use(
    requestInterceptor,
    requestErrorInterceptor
);

api.interceptors.response.use(
    responseInterceptor,
    responseErrorInterceptor
);

export default api;