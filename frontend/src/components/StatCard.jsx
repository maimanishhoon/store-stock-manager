import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'emerald', alert = false, className = '' }) => {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-100',
      iconBg: 'bg-blue-100 text-blue-700',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-100',
      iconBg: 'bg-amber-100 text-amber-700',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-100',
      iconBg: 'bg-purple-100 text-purple-700',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-100',
      iconBg: 'bg-rose-100 text-rose-700',
    },
  };

  const currentStyle = colorStyles[color] || colorStyles.emerald;

  return (
    <div
      className={`bg-white rounded-xl p-4 sm:p-5 border ${
        alert ? 'border-amber-300 ring-2 ring-amber-100' : 'border-gray-200/80'
      } shadow-sm hover:shadow transition ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${currentStyle.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
