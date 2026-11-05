import axiosClient from './axiosClient';

export const discountApi = {
  getAllDiscounts: async () => {
    const res = await axiosClient.get('/api/discounts');
    return res.data;
  },
  applyDiscount: async (discountData) => {
    const res = await axiosClient.post('/api/discounts', discountData);
    return res.data;
  },
  removeDiscount: async (productId) => {
    const res = await axiosClient.delete(`/api/discounts/${productId}`);
    return res.data;
  },
};
