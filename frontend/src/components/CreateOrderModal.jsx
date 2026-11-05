import React, { useState } from 'react';
import { orderApi } from '../api/orderApi';
import { ClipboardList, Plus, Trash2, X, AlertCircle, Sparkles } from 'lucide-react';

const CreateOrderModal = ({ isOpen, onClose, onOrderCreated, products = [] }) => {
  if (!isOpen) return null;

  const [orderNumber, setOrderNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { productId: '', quantity: 1 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeProducts = products.filter((p) => p.productStatus === 'ACTIVE' && p.availableStock > 0);

  const addItemRow = () => {
    setItems((prev) => [...prev, { productId: '', quantity: 1 }]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItemRow = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Calculate live order total
  let orderTotal = 0;
  items.forEach((item) => {
    const product = products.find((p) => p.id === Number(item.productId));
    if (product) {
      const qty = parseInt(item.quantity) || 0;
      orderTotal += (parseFloat(product.finalSellingPrice) || 0) * qty;
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (items.some((it) => !it.productId)) {
      setError('Please select a product for every row.');
      return;
    }

    for (const it of items) {
      const prod = products.find((p) => p.id === Number(it.productId));
      const qty = parseInt(it.quantity) || 0;
      if (qty <= 0) {
        setError('Quantities must be at least 1.');
        return;
      }
      if (prod && qty > prod.availableStock) {
        setError(`Requested quantity (${qty}) for "${prod.name}" exceeds available stock (${prod.availableStock}).`);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        orderNumber: orderNumber.trim() || undefined,
        items: items.map((it) => ({
          productId: Number(it.productId),
          quantity: parseInt(it.quantity),
        })),
        notes: notes.trim() || undefined,
      };

      await orderApi.createOrder(payload);
      onOrderCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create packing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-gray-900">Create Internal Packing Request</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Custom Order Number (Leave blank to auto-generate)
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. ORD-DIWALI-101 (Optional)"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                Select Packing Items *
              </label>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Item</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, index) => {
                const selectedProd = products.find((p) => p.id === Number(item.productId));
                return (
                  <div
                    key={index}
                    className="p-3 bg-gray-50/80 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                  >
                    <div className="flex-1">
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => updateItemRow(index, 'productId', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      >
                        <option value="">-- Choose Product --</option>
                        {activeProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.productCode}) - Avail: {p.availableStock} | ₹{p.finalSellingPrice}
                          </option>
                        ))}
                      </select>
                      {selectedProd && (
                        <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500">
                          <span>Max available: {selectedProd.availableStock}</span>
                          <span className="font-semibold text-emerald-700">
                            Unit Snapshot: ₹{selectedProd.finalSellingPrice}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="w-full sm:w-28 flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max={selectedProd ? selectedProd.availableStock : 9999}
                        required
                        value={item.quantity}
                        onChange={(e) => updateItemRow(index, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-center font-bold"
                      />
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        className="p-2 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition self-center"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Preview */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900">Calculated Packing Value:</span>
            <span className="text-lg font-bold text-emerald-950">₹{orderTotal.toFixed(2)}</span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Packing Notes / Customer Specifications
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please pack in festive golden gift bag; handle sparklers with care..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              When submitted, required quantities are <strong>immediately reserved</strong> in inventory and dispatched in real time to the warehouse packing portal.
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm"
            >
              {loading ? 'Submitting...' : 'Dispatch Packing Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal;
