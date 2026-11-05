import React, { useRef, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { Bell, Check, Clock, PackageCheck, AlertTriangle, Truck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type) => {
    if (type?.includes('ORDER')) return <PackageCheck className="w-4 h-4 text-emerald-600" />;
    if (type?.includes('STOCK')) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    if (type?.includes('DISPATCH')) return <Truck className="w-4 h-4 text-teal-600" />;
    return <Sparkles className="w-4 h-4 text-indigo-500" />;
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-800">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            No notifications yet
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.isRead) markAsRead(item.id);
                if (item.referenceId && item.type.includes('ORDER')) {
                  onClose();
                  navigate('/admin/orders');
                }
              }}
              className={`p-3.5 hover:bg-gray-50 cursor-pointer transition flex items-start space-x-3 ${
                !item.isRead ? 'bg-emerald-50/40' : ''
              }`}
            >
              <div className="mt-0.5 p-1.5 bg-gray-100 rounded-lg flex-shrink-0">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-semibold ${!item.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                    {item.title}
                  </h4>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 ml-2" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{item.message}</p>
                <div className="flex items-center mt-1 text-[10px] text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
