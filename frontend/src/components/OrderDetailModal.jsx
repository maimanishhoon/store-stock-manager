import React, { useState } from 'react';
import { orderApi } from '../api/orderApi';
import { useAuth } from '../context/AuthContext';
import StatusBadge from './StatusBadge';
import {
  X,
  Clock,
  User,
  Package,
  CheckCircle,
  Truck,
  Ban,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const OrderDetailModal = ({ isOpen, onClose, order, onOrderUpdated }) => {
  if (!isOpen || !order) return null;

  const { role, isAdmin, isPackingStaff } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusNote, setStatusNote] = useState('');

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      setError(null);
      await orderApi.updateOrderStatus(order.id, {
        status: newStatus,
        notes: statusNote.trim() || undefined,
      });
      setStatusNote('');
      onOrderUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Status update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-gray-900">{order.orderNumber}</h3>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Created on {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Meta Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-xl text-xs">
            <div>
              <span className="text-gray-500 block">Requested By</span>
              <span className="font-semibold text-gray-800 flex items-center mt-0.5">
                <User className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {order.customerPhone ? `${order.customerPhone} (${order.customerName || 'Shopper'})` : order.requestedBy}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Assigned Packer</span>
              <span className="font-semibold text-gray-800 flex items-center mt-0.5">
                <Package className="w-3.5 h-3.5 mr-1 text-teal-600" />
                {order.packingStaff || 'Unassigned (Waiting)'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Payment Mode</span>
              <span className="font-semibold text-gray-800 block mt-0.5">
                {order.paymentType || 'CASH'} ({order.paymentStatus || 'PAID'})
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Final Amount</span>
              <span className="font-bold text-emerald-700 text-sm mt-0.5 block">
                ₹{parseFloat(order.finalPayableAmount || order.totalAmount || 0).toFixed(2)}
              </span>
              {order.counterDiscountAmount > 0 && (
                <span className="text-[10px] text-amber-600 font-semibold">
                  (₹{parseFloat(order.counterDiscountAmount).toFixed(0)} disc applied)
                </span>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Packing Items Checklist ({order.items?.length || 0})
            </h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Product</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-600">Qty</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-gray-600">Unit Snapshot</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-gray-600">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {order.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-gray-900">{item.productName}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{item.productCode}</div>
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold text-gray-900">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-md">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-600 font-mono">
                        ₹{parseFloat(item.priceSnapshot).toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-gray-900 font-mono">
                        ₹{parseFloat(item.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-xs">
              <span className="font-semibold text-amber-900 block mb-1">Order Notes:</span>
              <p className="text-amber-800 whitespace-pre-line">{order.notes}</p>
            </div>
          )}

          {/* Status Workflow Action Buttons */}
          <div className="pt-3 border-t border-gray-100 space-y-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Workflow Actions
            </h4>

            {/* Optional note with transition */}
            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <input
                type="text"
                placeholder="Add transition note (optional)..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            )}

            <div className="flex flex-wrap gap-2">
              {/* Packing Staff Actions */}
              {isPackingStaff && (
                <>
                  {(order.status === 'PENDING' || order.status === 'APPROVED') && (
                    <button
                      onClick={() => handleStatusChange('ACCEPTED')}
                      disabled={loading}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center space-x-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Accept Packing Request</span>
                    </button>
                  )}

                  {order.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleStatusChange('PACKING')}
                      disabled={loading}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center space-x-1.5"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Start Packing Now</span>
                    </button>
                  )}

                  {order.status === 'PACKING' && (
                    <button
                      onClick={() => handleStatusChange('READY')}
                      disabled={loading}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center space-x-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Packing Completed / Ready</span>
                    </button>
                  )}

                  {order.status === 'READY' && (
                    <button
                      onClick={() => handleStatusChange('DISPATCHED')}
                      disabled={loading}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center space-x-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Mark Order Dispatched</span>
                    </button>
                  )}
                </>
              )}

              {/* Admin Actions */}
              {isAdmin && (
                <>
                  {(order.status === 'READY' || order.status === 'DISPATCHED') && (
                    <button
                      onClick={() => handleStatusChange('DELIVERED')}
                      disabled={loading}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-sm flex items-center space-x-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Confirm Customer Receipt / Delivered</span>
                    </button>
                  )}

                  {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleStatusChange('CANCELLED')}
                      disabled={loading}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition flex items-center space-x-1.5 ml-auto"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel Order (Release Reserved Stock)</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
