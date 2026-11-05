import axios from 'axios';

const publicClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicApi = {
  getCategories: async () => {
    const res = await publicClient.get('/api/public/categories');
    return res.data;
  },

  getProducts: async (params = {}) => {
    const res = await publicClient.get('/api/public/products', { params });
    return res.data;
  },

  placeOrder: async (orderPayload) => {
    const res = await publicClient.post('/api/public/orders', orderPayload);
    return res.data;
  },

  getOrder: async (orderNumber) => {
    const res = await publicClient.get(`/api/public/orders/${orderNumber}`);
    return res.data;
  },

  trackOrdersByPhone: async (phone) => {
    const res = await publicClient.get('/api/public/orders/track', {
      params: { phone },
    });
    return res.data;
  },
};
