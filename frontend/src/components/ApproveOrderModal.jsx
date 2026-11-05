import React, { useState } from 'react';
import { orderApi } from '../api/orderApi';
import {
  X,
  CheckCircle,
  Percent,
  Banknote,
  CreditCard,
  Ban,
  Clock,
  Printer,
  Sparkles,
  AlertCircle,
  Phone,
  User,
  ShoppingBag,
} from 'lucide-react';

const ApproveOrderModal = ({ isOpen, onClose, order, onOrderApproved }) => {
  if (!isOpen || !order) return null;

  const [discountValue, setDiscountValue] = useState('');
  const [paymentType, setPaymentType] = useState('CASH');
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const subtotal = parseFloat(order.totalAmount || 0);
  const discountPercent = parseFloat(discountValue) || 0;
  const calculatedDiscount = discountPercent > 0 ? (subtotal * discountPercent) / 100 : 0;
  const finalPayable = Math.max(0, subtotal - calculatedDiscount);

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        discountType: discountPercent > 0 ? 'PERCENTAGE' : 'NONE',
        discountValue: discountPercent,
        paymentType,
        paymentStatus: paymentType === 'SKIP' ? 'SKIPPED' : paymentStatus,
        paymentNotes: paymentNotes.trim() || undefined,
        notes: adminNotes.trim() || undefined,
      };

      await orderApi.approveOrder(order.id, payload);
      onOrderApproved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Cancel this customer order and release all reserved stock?')) return;
    try {
      setLoading(true);
      await orderApi.updateOrderStatus(order.id, {
        status: 'CANCELLED',
        notes: 'Rejected / cancelled by counter admin',
      });
      onOrderApproved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Cancellation failed');
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-gray-900">{order.orderNumber}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Customer QR Order • {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Customer Profile Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-3.5 rounded-2xl text-xs border border-gray-100">
            <div>
              <span className="text-gray-400 block font-medium">Customer Mobile</span>
              <span className="font-bold text-gray-900 flex items-center mt-0.5 text-sm">
                <Phone className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {order.customerPhone || 'Counter Walk-in'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Customer Name</span>
              <span className="font-semibold text-gray-800 flex items-center mt-0.5">
                <User className="w-3.5 h-3.5 mr-1 text-blue-600" />
                {order.customerName || 'In-Store Guest'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Order Channel</span>
              <span className="font-semibold text-amber-800 flex items-center mt-0.5 uppercase tracking-wide text-[11px]">
                {order.orderSource || 'CUSTOMER_QR'}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Ordered Items ({order.items?.length || 0})</span>
              <span className="text-gray-500 font-mono">Subtotal: ₹{subtotal.toFixed(2)}</span>
            </h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 font-semibold text-gray-600">
                  <tr>
                    <th className="px-3.5 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3.5 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3.5 py-2 font-medium text-gray-900">
                        {item.productName}
                        <div className="text-[10px] text-gray-400 font-mono">{item.productCode}</div>
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-gray-600">
                        ₹{parseFloat(item.priceSnapshot).toFixed(2)}
                      </td>
                      <td className="px-3.5 py-2 text-right font-mono font-bold text-gray-900">
                        ₹{parseFloat(item.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Step 1: Counter Discount */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 space-y-3">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1">
              <Percent className="w-3.5 h-3.5" />
              <span>Step 1: Counter Discount (% on Total)</span>
            </h4>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="0"
                max="99"
                step="1"
                placeholder="e.g. 10"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden w-32 font-bold"
              />
              <span className="text-sm font-bold text-amber-900">% OFF total</span>
              {discountPercent > 0 && (
                <span className="text-xs text-amber-700 font-semibold">
                  = -₹{calculatedDiscount.toFixed(2)} saved
                </span>
              )}
            </div>
          </div>

          {/* Step 2: Payment Selector & Verification */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center space-x-1">
              <Banknote className="w-3.5 h-3.5" />
              <span>Step 2: Select Payment Type & Verify</span>
            </h4>

            {/* Payment Type Selection */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentType('CASH');
                  setPaymentStatus('PAID');
                }}
                className={`p-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center space-y-1 border ${
                  paymentType === 'CASH'
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50/50'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash Payment</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentType('ONLINE');
                  setPaymentStatus('PAID');
                }}
                className={`p-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center space-y-1 border ${
                  paymentType === 'ONLINE'
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50/50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Online / UPI</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentType('SKIP');
                  setPaymentStatus('SKIPPED');
                }}
                className={`p-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center space-y-1 border ${
                  paymentType === 'SKIP'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50/50'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Skip Payment</span>
              </button>
            </div>

            {/* Payment Details / Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="PAID">PAID (Verified & Collected)</option>
                  <option value="SKIPPED">SKIPPED (Pay Later / Shop Tab)</option>
                  <option value="PENDING">PENDING (Awaiting Cashier)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Payment Note / UPI Ref #
                </label>
                <input
                  type="text"
                  placeholder="e.g. GPay UPI Txn 9821 / Cash 500"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Billing Calculation Summary */}
          <div className="bg-gray-900 text-white p-4 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Gross Items Subtotal:</span>
              <span className="font-mono">₹{subtotal.toFixed(2)}</span>
            </div>
            {calculatedDiscount > 0 && (
              <div className="flex justify-between text-amber-400 font-semibold">
                <span>Counter Discount Deduction:</span>
                <span className="font-mono">-₹{calculatedDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-white pt-2 border-t border-gray-800">
              <span>Net Amount to Collect:</span>
              <span className="text-emerald-400 font-mono">₹{finalPayable.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 pt-1">
              <span>Payment Mode: {paymentType} ({paymentStatus})</span>
              <span>Warehouse: Instant WebSocket Alert</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCancelOrder}
            disabled={loading}
            className="px-3 py-2 text-xs font-semibold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center space-x-1"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Cancel Order</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-gray-600 hover:bg-gray-200 transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={loading}
              className="px-5 py-2.5 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition flex items-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? 'Approving...' : 'Approve & Send to Warehouse'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproveOrderModal;
