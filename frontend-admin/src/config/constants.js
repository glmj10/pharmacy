export const API_CONFIG = {
    // Sử dụng proxy trong development, full URL trong production
    BASE_URL: import.meta.env.VITE_API_URL || (
        import.meta.env.DEV ? "/api/v1" : "http://localhost:8080/api/v1"
    ),
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
};

export const ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        REFRESH_TOKEN: "/auth/refresh-token",
        REGISTER: "/auth/register",
        INFO: "/auth/info",
        PASSWORD: "/auth/password",
    },
    USERS: {
        GET_ALL: "/users",
        GET_BY_ID: (id) => `/users/${id}`,
        CREATE: "/users",
        UPDATE: (id) => `/users/${id}`,
        DELETE: (id) => `/users/${id}`,
        USER_INFO: "/users/me",
        PROFILE: "/users/profile",
    },
    PRODUCTS: {
        GET_ALL: "/products",
        GET_BY_ID: (id) => `/products/${id}`,
        GET_BY_SLUG: (slug) => `/products/slug/${slug}`,
        CREATE: "/products",
        UPDATE: (id) => `/products/${id}`,
        DELETE: (id) => `/products/${id}`,
        UPDATE_STATUS: (id) => `/products/status/${id}`,
        GET_CMS: "/products/cms",
    },
    ORDERS: {
        GET_ALL: "/orders",
        GET_BY_ID: (id) => `/orders/${id}`,
        GET_DETAILS: (id) => `/orders/detail/${id}`,
        CREATE: "/orders",
        UPDATE_STATUS: (id) => `/orders/status/${id}`,
        UPDATE_PAYMENT_STATUS: (id) => `/orders/payment-status/${id}`,
        MY_ORDERS: "/orders/my-orders",
    },
    CATEGORIES: {
        GET_ALL: "/categories",
        GET_BY_ID: (id) => `/categories/${id}`,
        CREATE: "/categories",
        UPDATE: (id) => `/categories/${id}`,
        DELETE: (id) => `/categories/${id}`,
    },
    BRANDS: {
        GET_ALL: "/brands",
        GET_BY_ID: (id) => `/brands/${id}`,
        CREATE: "/brands",
        UPDATE: (id) => `/brands/${id}`,
        DELETE: (id) => `/brands/${id}`,
    },
    CONTACTS: {
        GET_ALL: "/contacts",
        GET_BY_ID: (id) => `/contacts/${id}`,
        CREATE: "/contacts",
        UPDATE: (id) => `/contacts/${id}`,
        DELETE: (id) => `/contacts/${id}`,
    },

    BLOG: {
        GET_ALL: "/blogs",
        GET_BY_ID: (id) => `/blogs/${id}`,
        CREATE: "/blogs",
        UPDATE: (id) => `/blogs/${id}`,
        DELETE: (id) => `/blogs/${id}`,
    }
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    USER_INFO: 'userInfo',
    THEME: 'theme',
    LANGUAGE: 'language',
};

export const ORDER_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PROCESSING: 'PROCESSING',
    SHIPPING: 'SHIPPING',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
};

export const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PENDING]: { label: 'Chờ xử lý', color: 'warning' },
    [ORDER_STATUS.CONFIRMED]: { label: 'Đã xác nhận', color: 'info' },
    [ORDER_STATUS.PROCESSING]: { label: 'Đang xử lý', color: 'primary' },
    [ORDER_STATUS.SHIPPING]: { label: 'Đang giao', color: 'secondary' },
    [ORDER_STATUS.DELIVERED]: { label: 'Đã giao', color: 'success' },
    [ORDER_STATUS.CANCELLED]: { label: 'Đã hủy', color: 'danger' },
};

export const PAYMENT_STATUS = {
    UNPAID: 'UNPAID',
    PAID: 'PAID',
    REFUNDED: 'REFUNDED',
};

export const PAYMENT_STATUS_LABELS = {
    [PAYMENT_STATUS.UNPAID]: { label: 'Chưa thanh toán', color: 'warning' },
    [PAYMENT_STATUS.PAID]: { label: 'Đã thanh toán', color: 'success' },
    [PAYMENT_STATUS.REFUNDED]: { label: 'Đã hoàn tiền', color: 'info' },
};