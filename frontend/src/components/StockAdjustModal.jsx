import React, { useState } from 'react';
import { inventoryApi } from '../api/inventoryApi';
import { Layers, X, PlusCircle, MinusCircle, Sliders } from 'lucide-react';

const StockAdjustModal = ({ isOpen, onClose, product, onAdjustSuccess }) => {
  if (!isOpen || !product) return null;

  const [transactionType, setTransactionType] = useState('ADD_STOCK');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentStock = product.availableStock || 0;

  const calculatePreviewStock = () => {
    const q = parseInt(quantity) || 0;
    if (transactionType === 'ADD_STOCK') return currentStock + q;
    if (transactionType === 'REDUCE_STOCK') return Math.max(0, currentStock - q);
    if (transactionType === 'MANUAL_ADJUSTMENT') return Math.max(0, q);
    return currentStock;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      setError('Please enter a valid non-negative quantity');
      return;
    }

    if (transactionType === 'REDUCE_STOCK' && qty > currentStock) {
      setError(`Cannot reduce by ${qty}. Current stock is only ${currentStock}.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await inventoryApi.adjustStock({
        productId: product.id,
        transactionType,
        quantity: qty,
        reason: reason.trim() || `Manual ${transactionType} adjustment`,
      });

      onAdjustSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-gray-900">Adjust Inventory Stock</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Product Info Summary */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{product.name}</h4>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{product.productCode}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 block">Current Stock</span>
              <span className="text-lg font-bold text-emerald-700">{currentStock}</span>
            </div>
          </div>

          {/* Adjustment Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Adjustment Action
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTransactionType('ADD_STOCK')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition ${
                  transactionType === 'ADD_STOCK'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Add Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setTransactionType('REDUCE_STOCK')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition ${
                  transactionType === 'REDUCE_STOCK'
                    ? 'border-amber-600 bg-amber-50 text-amber-800'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MinusCircle className="w-4 h-4 text-amber-600" />
                <span>Reduce Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setTransactionType('MANUAL_ADJUSTMENT')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition ${
                  transactionType === 'MANUAL_ADJUSTMENT'
                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Set Exact</span>
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              {transactionType === 'MANUAL_ADJUSTMENT' ? 'New Exact Stock Count *' : 'Quantity Units *'}
            </label>
            <input
              type="number"
              min="0"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 50"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Live Preview */}
          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 flex items-center justify-between text-xs">
            <span className="text-gray-600">Stock after adjustment:</span>
            <span className="font-bold text-emerald-800 text-sm">
              {quantity !== '' ? calculatePreviewStock() : currentStock} units
            </span>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Reason / Stock Note
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Festival restocking, damaged items, physical audit..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
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
              {loading ? 'Saving...' : 'Apply Stock Change'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustModal;
