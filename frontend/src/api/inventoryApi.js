import axiosClient from './axiosClient';

export const inventoryApi = {
  getInventory: async () => {
    const res = await axiosClient.get('/api/inventory');
    return res.data;
  },
  adjustStock: async (adjustmentData) => {
    const res = await axiosClient.post('/api/inventory/adjust', adjustmentData);
    return res.data;
  },
  getAllTransactions: async () => {
    const res = await axiosClient.get('/api/inventory/transactions');
    return res.data;
  },
  getTransactionsForProduct: async (productId) => {
    const res = await axiosClient.get(`/api/inventory/transactions/product/${productId}`);
    return res.data;
  },
  getLowStock: async () => {
    const res = await axiosClient.get('/api/inventory/low-stock');
    return res.data;
  },
  getOutOfStock: async () => {
    const res = await axiosClient.get('/api/inventory/out-of-stock');
    return res.data;
  },
};
