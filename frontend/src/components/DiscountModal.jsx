import React, { useState, useEffect } from 'react';
import { discountApi } from '../api/discountApi';
import { BadgePercent, X, DollarSign, Tag, Check, Trash2 } from 'lucide-react';

const DiscountModal = ({ isOpen, onClose, product, onDiscountUpdated }) => {
  if (!isOpen || !product) return null;

  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (product) {
      setDiscountType(product.discountType === 'NONE' ? 'PERCENTAGE' : product.discountType);
      setDiscountValue(product.discountValue || 10);
      setError(null);
    }
  }, [product, isOpen]);

  const sellingPrice = parseFloat(product.sellingPrice) || 0;
  const numDiscountValue = parseFloat(discountValue) || 0;

  const calculateFinal = () => {
    if (discountType === 'PERCENTAGE') {
      return Math.max(0, sellingPrice - (sellingPrice * numDiscountValue) / 100);
    }
    if (discountType === 'FIXED') {
      return Math.max(0, sellingPrice - numDiscountValue);
    }
    return sellingPrice;
  };

  const calculatedFinalPrice = calculateFinal();
  const savings = Math.max(0, sellingPrice - calculatedFinalPrice);

  const handleApply = async (e) => {
    e.preventDefault();
    if (numDiscountValue <= 0) {
      setError('Discount value must be greater than 0');
      return;
    }
    if (discountType === 'PERCENTAGE' && numDiscountValue > 100) {
      setError('Percentage discount cannot exceed 100%');
      return;
    }
    if (discountType === 'FIXED' && numDiscountValue > sellingPrice) {
      setError('Fixed discount cannot exceed original selling price');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await discountApi.applyDiscount({
        productId: product.id,
        discountType,
        discountValue: numDiscountValue,
      });
      onDiscountUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to apply discount');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setLoading(true);
      setError(null);
      await discountApi.removeDiscount(product.id);
      onDiscountUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to remove discount');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <BadgePercent className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-gray-900">Manage Festive Discount</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Product Header */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs flex justify-between items-center">
            <div>
              <div className="font-semibold text-gray-900">{product.name}</div>
              <div className="text-gray-500 font-mono text-[11px]">{product.productCode}</div>
            </div>
            <div className="text-right">
              <span className="text-gray-500 block">Original Price</span>
              <span className="font-bold text-gray-900 text-sm">₹{sellingPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Discount Type Options */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Discount Calculation Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDiscountType('PERCENTAGE')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                  discountType === 'PERCENTAGE'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>Percentage (%)</span>
              </button>

              <button
                type="button"
                onClick={() => setDiscountType('FIXED')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                  discountType === 'FIXED'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Fixed Value (₹)</span>
              </button>
            </div>
          </div>

          {/* Discount Value */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              {discountType === 'PERCENTAGE' ? 'Discount Percentage (%) *' : 'Discount Amount in Rupees (₹) *'}
            </label>
            <input
              type="number"
              step="0.01"
              min="0.1"
              required
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Live Price Preview Box */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Original Price:</span>
              <span className="line-through font-mono">₹{sellingPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Customer Festive Savings:</span>
              <span>-₹{savings.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-emerald-200/80 flex justify-between items-center">
              <span className="font-bold text-emerald-950 text-sm">Final Selling Price:</span>
              <span className="font-bold text-emerald-950 text-lg">₹{calculatedFinalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {product.discountType !== 'NONE' ? (
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Discount</span>
              </button>
            ) : <div />}

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-3.5 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Discount</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscountModal;
