import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import {
  Bell,
  Check,
  Clock,
  PackageCheck,
  AlertTriangle,
  Truck,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotification();
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const getIcon = (type) => {
    if (type?.includes('ORDER')) return <PackageCheck className="w-5 h-5 text-emerald-600" />;
    if (type?.includes('STOCK')) return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    if (type?.includes('DISPATCH')) return <Truck className="w-5 h-5 text-teal-600" />;
    return <Sparkles className="w-5 h-5 text-indigo-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Notifications</h1>
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time shop counter and warehouse packing event notifications
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchNotifications}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition shadow-xs"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition shadow-xs flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'ALL'
              ? 'bg-gray-900 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'UNREAD'
              ? 'bg-emerald-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs divide-y divide-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            No notifications found.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 flex items-start space-x-4 transition hover:bg-gray-50/70 ${
                !item.isRead ? 'bg-emerald-50/30' : ''
              }`}
            >
              <div className="p-2.5 bg-gray-100 rounded-xl flex-shrink-0">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center">
                    <span>{item.title}</span>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 ml-2" />
                    )}
                  </h4>
                  <span className="text-[11px] text-gray-400 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {item.message}
                </p>

                <div className="mt-3 flex items-center space-x-3">
                  {!item.isRead && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark as Read</span>
                    </button>
                  )}

                  {item.referenceId && item.type.includes('ORDER') && (
                    <button
                      onClick={() => navigate('/admin/orders')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      View Order Details →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
