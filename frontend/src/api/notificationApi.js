import axiosClient from './axiosClient';

export const notificationApi = {
  getNotifications: async () => {
    const res = await axiosClient.get('/api/notifications');
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await axiosClient.get('/api/notifications/unread-count');
    return res.data.unreadCount;
  },
  markAsRead: async (id) => {
    const res = await axiosClient.patch(`/api/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await axiosClient.post('/api/notifications/read-all');
    return res.data;
  },
};
