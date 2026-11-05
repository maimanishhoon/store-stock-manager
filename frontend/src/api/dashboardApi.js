import axiosClient from './axiosClient';

export const dashboardApi = {
  getStats: async () => {
    const res = await axiosClient.get('/api/dashboard/stats');
    return res.data;
  },
};
