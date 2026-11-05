import axios from 'axios';

// VITE_API_URL is baked in at build time by Vite.
// In production on Railway, set VITE_API_URL=https://your-backend.up.railway.app
// In local dev (port 5173), the Vite proxy handles /api so baseURL can be empty.
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
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

// Handle 401 responses
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
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
