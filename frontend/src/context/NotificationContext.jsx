import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { token, user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const stompClientRef = useRef(null);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = { id, ...toast };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
      return;
    }

    fetchNotifications();

    // Setup STOMP WebSocket client
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {}, // Disable noisy logs
    });

    client.onConnect = () => {
      // Subscribe to real-time notification topic
      client.subscribe('/topic/notifications', (message) => {
        try {
          const payload = JSON.parse(message.body);
          if (
            payload.targetRole === 'ALL' ||
            payload.targetRole === user?.role
          ) {
            setNotifications((prev) => [payload, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Pop toast alert with sound-like urgency for new customer orders
            const isNewCustomerOrder = payload.type === 'NEW_CUSTOMER_ORDER';
            addToast({
              title: payload.title,
              message: payload.message,
              type: payload.type?.includes('CANCELLED')
                ? 'error'
                : payload.type?.includes('LOW_STOCK')
                ? 'warning'
                : isNewCustomerOrder
                ? 'success'
                : 'info',
            });

            // Trigger order list refresh for admin on new customer order
            if (isNewCustomerOrder || payload.type === 'NEW_ORDER') {
              window.dispatchEvent(new CustomEvent('shop:orderUpdated', { detail: payload }));
            }
          }
        } catch (e) {
          console.error('Error handling WebSocket notification:', e);
        }
      });

      // Subscribe to real-time order status topic
      client.subscribe('/topic/orders', (message) => {
        try {
          const order = JSON.parse(message.body);
          // Dispatch custom browser event for order listeners
          window.dispatchEvent(new CustomEvent('shop:orderUpdated', { detail: order }));
        } catch (e) {
          console.error('Error handling WebSocket order update:', e);
        }
      });
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [isAuthenticated, user?.role]);

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        addToast,
        removeToast,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
