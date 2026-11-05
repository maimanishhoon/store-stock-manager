import React from 'react';

const statusConfig = {
  PENDING_APPROVAL: {
    label: 'Customer QR (Awaiting Approval)',
    className: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    dot: 'bg-amber-500 animate-pulse',
  },
  APPROVED: {
    label: 'Approved (Queued for Warehouse)',
    className: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    dot: 'bg-cyan-500',
  },
  PENDING: {
    label: 'Internal Order',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  ACCEPTED: {
    label: 'Accepted',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  PACKING: {
    label: 'Packing In Progress',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
  },
  READY: {
    label: 'Ready for Collection',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500 animate-pulse',
  },
  DISPATCHED: {
    label: 'Dispatched',
    className: 'bg-teal-50 text-teal-700 border-teal-200',
    dot: 'bg-teal-500',
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-green-100 text-green-800 border-green-300',
    dot: 'bg-green-600',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
};

const StatusBadge = ({ status, size = 'md' }) => {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-700 border-gray-300',
    dot: 'bg-gray-400',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full ${config.className} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
