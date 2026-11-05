import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://localhost:8080'
    : typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:8080');

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('diwali_shop_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized 401s
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not already on login page, remove token
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('diwali_shop_token');
        localStorage.removeItem('diwali_shop_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
export { API_BASE_URL };
