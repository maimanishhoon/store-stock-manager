import React, { useState, useEffect } from 'react';
import { productApi } from '../api/productApi';
import { getImageUrl } from '../utils/imageUrl';
import { X, Upload, Camera } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, onSave, product = null, categories = [] }) => {
  const isEditing = !!product;

  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    imageUrl: '',
    sellingPrice: '',
    discountValue: '',
    initialStock: '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    if (product) {
      setForm({
        name: product.name || '',
        categoryId: product.category?.id || '',
        imageUrl: product.imageUrl || '',
        sellingPrice: product.sellingPrice || '',
        discountValue: product.discountValue > 0 ? product.discountValue : '',
        initialStock: product.availableStock || '',
      });
    } else {
      setForm({
        name: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        imageUrl: '',
        sellingPrice: '',
        discountValue: '',
        initialStock: '',
      });
    }
    setError(null);
  }, [product, isOpen]);

  if (!isOpen) return null;

  const price = parseFloat(form.sellingPrice) || 0;
  const disc = parseFloat(form.discountValue) || 0;
  const discountPercent = disc > 0 && disc < 100 ? disc : 0;
  const finalPrice = discountPercent > 0 ? (price - (price * discountPercent) / 100).toFixed(2) : price.toFixed(2);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      setError(null);
      const res = await productApi.uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: res.imageUrl }));
    } catch {
      setError('Image upload failed. Try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Product name is required.');
    if (!form.categoryId) return setError('Please select a category.');
    if (!form.sellingPrice || parseFloat(form.sellingPrice) <= 0) return setError('Enter a valid price.');
    if (!form.initialStock || parseInt(form.initialStock) < 0) return setError('Enter a valid quantity.');

    try {
      setSubmitting(true);
      setError(null);
      const discVal = parseFloat(form.discountValue) || 0;
      const payload = {
        name: form.name.trim(),
        productCode: isEditing ? product.productCode : 'DW-' + Date.now().toString().slice(-6),
        categoryId: Number(form.categoryId),
        imageUrl: form.imageUrl,
        sellingPrice: parseFloat(form.sellingPrice),
        purchasePrice: 0,
        discountType: discVal > 0 ? 'PERCENTAGE' : 'NONE',
        discountValue: discVal,
        initialStock: parseInt(form.initialStock) || 0,
        minimumStockLevel: 5,
        productStatus: 'ACTIVE',
      };

      if (isEditing) {
        await productApi.updateProduct(product.id, payload);
      } else {
        await productApi.createProduct(payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100 bg-amber-50">
          <h3 className="text-base font-black text-gray-900">
            {isEditing ? '✏️ Edit Product' : '➕ Add New Product'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Photo Upload — big tap target for phone */}
          <div className="flex flex-col items-center">
            <label className="cursor-pointer w-full">
              <div className={`w-full h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition ${
                form.imageUrl ? 'border-amber-300 bg-amber-50/30' : 'border-gray-300 bg-gray-50 hover:bg-amber-50/30 hover:border-amber-300'
              }`}>
                {form.imageUrl ? (
                  <img src={getImageUrl(form.imageUrl)} alt="preview" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-gray-400 mb-1" />
                    <span className="text-xs font-semibold text-gray-500">
                      {uploadingImage ? 'Uploading...' : 'Tap to add photo'}
                    </span>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
            </label>
            {form.imageUrl && (
              <button type="button" onClick={() => setForm(p => ({ ...p, imageUrl: '' }))}
                className="mt-1.5 text-xs text-rose-500 font-semibold">
                Remove photo
              </button>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Deluxe Ground Chakkar"
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Category *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm(p => ({ ...p, categoryId: e.target.value }))}
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Price & Quantity side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.sellingPrice}
                onChange={(e) => setForm(p => ({ ...p, sellingPrice: e.target.value }))}
                placeholder="0"
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={form.initialStock}
                onChange={(e) => setForm(p => ({ ...p, initialStock: e.target.value }))}
                placeholder="0"
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
              />
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Product Discount % <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="0"
                max="99"
                step="1"
                value={form.discountValue}
                onChange={(e) => setForm(p => ({ ...p, discountValue: e.target.value }))}
                placeholder="e.g. 10"
                className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <span className="text-sm font-bold text-gray-500">% OFF</span>
            </div>
            {discountPercent > 0 && price > 0 && (
              <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900">
                Customer pays: <span className="text-base font-black text-amber-700">₹{finalPrice}</span>
                <span className="text-gray-500 line-through ml-2">₹{price.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-sm shadow-lg shadow-amber-500/30 transition disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Add to Inventory'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
