import axiosClient from './axiosClient';

export const authApi = {
  login: async (credentials) => {
    const res = await axiosClient.post('/api/auth/login', credentials);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await axiosClient.get('/api/auth/me');
    return res.data;
  },
};
