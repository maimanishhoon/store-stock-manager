import axiosClient from './axiosClient';

export const orderApi = {
  getOrders: async (status = null) => {
    const params = status ? { status } : {};
    const res = await axiosClient.get('/api/orders', { params });
    return res.data;
  },
  getPackingQueue: async () => {
    const res = await axiosClient.get('/api/orders/packing/queue');
    return res.data;
  },
  getOrderById: async (id) => {
    const res = await axiosClient.get(`/api/orders/${id}`);
    return res.data;
  },
  createOrder: async (orderData) => {
    const res = await axiosClient.post('/api/orders', orderData);
    return res.data;
  },
  approveOrder: async (id, approvalData) => {
    const res = await axiosClient.post(`/api/orders/${id}/approve`, approvalData);
    return res.data;
  },
  updateOrderStatus: async (id, statusData) => {
    const res = await axiosClient.patch(`/api/orders/${id}/status`, statusData);
    return res.data;
  },
};
