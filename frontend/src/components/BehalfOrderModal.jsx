import React, { useState } from 'react';
import { publicApi } from '../api/publicApi';
import { X, Plus, Trash2, User, Phone, AlertCircle } from 'lucide-react';

const BehalfOrderModal = ({ isOpen, onClose, products = [], onOrderCreated }) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeProducts = products.filter((p) => p.productStatus === 'ACTIVE' && p.availableStock > 0);

  const addRow = () => setItems((p) => [...p, { productId: '', quantity: 1 }]);
  const removeRow = (i) => setItems((p) => p.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) =>
    setItems((p) => { const n = [...p]; n[i] = { ...n[i], [field]: val }; return n; });

  const total = items.reduce((sum, it) => {
    const prod = products.find((p) => p.id === Number(it.productId));
    return sum + (prod ? parseFloat(prod.finalSellingPrice || prod.sellingPrice) * (parseInt(it.quantity) || 0) : 0);
  }, 0);

  const reset = () => {
    setCustomerName(''); setCustomerPhone(''); setNotes('');
    setItems([{ productId: '', quantity: 1 }]); setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) return setError('Customer name is required.');
    if (!/^[0-9]{10}$/.test(customerPhone.trim())) return setError('Enter a valid 10-digit mobile number.');
    if (items.some((it) => !it.productId)) return setError('Select a product for every row.');
    for (const it of items) {
      const prod = products.find((p) => p.id === Number(it.productId));
      const qty = parseInt(it.quantity) || 0;
      if (qty <= 0) return setError('Quantity must be at least 1.');
      if (prod && qty > prod.availableStock)
        return setError(`"${prod.name}" only has ${prod.availableStock} units available.`);
    }

    try {
      setLoading(true);
      setError(null);
      await publicApi.placeOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        notes: notes.trim() || undefined,
        items: items.map((it) => ({ productId: Number(it.productId), quantity: parseInt(it.quantity) })),
      });
      onOrderCreated();
      reset();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100 bg-amber-50 shrink-0">
          <div>
            <h3 className="text-base font-black text-gray-900">📋 Place Order on Behalf</h3>
            <p className="text-xs text-amber-700 mt-0.5">Admin placing order for a customer at counter</p>
          </div>
          <button onClick={() => { reset(); onClose(); }} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Customer Name *</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text" required value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer full name"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number *</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel" required maxLength={10} value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit number"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">Items *</label>
              <button type="button" onClick={addRow}
                className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center space-x-1">
                <Plus className="w-3.5 h-3.5" /><span>Add Item</span>
              </button>
            </div>

            {items.map((item, i) => {
              const prod = products.find((p) => p.id === Number(item.productId));
              return (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                  <select
                    required value={item.productId}
                    onChange={(e) => updateRow(i, 'productId', e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    <option value="">-- Select Product --</option>
                    {activeProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{parseFloat(p.finalSellingPrice || p.sellingPrice).toFixed(0)} (Stock: {p.availableStock})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number" min="1" max={prod?.availableStock || 999} required
                    value={item.quantity}
                    onChange={(e) => updateRow(i, 'quantity', e.target.value)}
                    className="w-16 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-center font-bold"
                  />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeRow(i)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-sm font-bold text-amber-900">Estimated Total</span>
            <span className="text-lg font-black text-amber-700">₹{total.toFixed(2)}</span>
          </div>

          {/* Notes */}
          <div>
            <input
              type="text" value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions (optional)"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
            ⚡ Order will go to <strong>PENDING_APPROVAL</strong> — you can then Review & Bill it from the orders list.
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <button type="button" onClick={() => { reset(); onClose(); }}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-black rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md shadow-amber-500/20 transition disabled:opacity-50"
          >
            {loading ? 'Placing...' : '🪔 Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BehalfOrderModal;
