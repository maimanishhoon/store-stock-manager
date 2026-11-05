import axiosClient from './axiosClient';

export const productApi = {
  getProducts: async (params = {}) => {
    const res = await axiosClient.get('/api/products', { params });
    return res.data;
  },
  getProductById: async (id) => {
    const res = await axiosClient.get(`/api/products/${id}`);
    return res.data;
  },
  getCategories: async () => {
    const res = await axiosClient.get('/api/categories');
    return res.data;
  },
  createProduct: async (productData) => {
    const res = await axiosClient.post('/api/products', productData);
    return res.data;
  },
  updateProduct: async (id, productData) => {
    const res = await axiosClient.put(`/api/products/${id}`, productData);
    return res.data;
  },
  deleteProduct: async (id) => {
    const res = await axiosClient.delete(`/api/products/${id}`);
    return res.data;
  },
  toggleStatus: async (id) => {
    const res = await axiosClient.patch(`/api/products/${id}/toggle-status`);
    return res.data;
  },
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosClient.post('/api/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
