import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Bell, X } from 'lucide-react';

const Toast = () => {
  const { toasts, removeToast } = useNotification();
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-[100] flex flex-col space-y-2 sm:max-w-sm w-auto pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Bell;
        let style = 'border-blue-500 bg-white';
        let iconStyle = 'text-blue-500';
        let titleStyle = 'text-gray-900';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          style = 'border-amber-500 bg-amber-50';
          iconStyle = 'text-amber-600';
          titleStyle = 'text-amber-900';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          style = 'border-orange-500 bg-orange-50';
          iconStyle = 'text-orange-600';
          titleStyle = 'text-orange-900';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          style = 'border-rose-500 bg-rose-50';
          iconStyle = 'text-rose-600';
          titleStyle = 'text-rose-900';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-3.5 rounded-2xl shadow-xl border-l-4 ${style} transition-all duration-300`}
          >
            <Icon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${iconStyle}`} />
            <div className="flex-1 mr-2 min-w-0">
              <h4 className={`text-sm font-bold ${titleStyle} leading-tight`}>{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
