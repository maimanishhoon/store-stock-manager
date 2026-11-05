import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import { inventoryApi } from '../../api/inventoryApi';
import { getImageUrl } from '../../utils/imageUrl';
import ProductModal from '../../components/ProductModal';
import StockAdjustModal from '../../components/StockAdjustModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import StockBadge from '../../components/StockBadge';
import { Plus, Search, Edit2, Trash2, Sliders, Power, RefreshCw, Flame } from 'lucide-react';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.query = search.trim();
      if (selectedCategory) params.categoryId = selectedCategory;
      const [prods, cats] = await Promise.all([
        productApi.getProducts(params),
        productApi.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, selectedCategory]);

  const handleToggle = async (id) => {
    try { await productApi.toggleStatus(id); load(); }
    catch (err) { alert(err.response?.data?.error || err.message); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await productApi.deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = products.filter((p) => {
    const s = search.toLowerCase();
    return p.name.toLowerCase().includes(s) || p.productCode.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">🪔 Inventory</h1>
          <p className="text-xs text-gray-500 mt-0.5">{products.length} products · Manage stock, prices & photos</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={load}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-amber-50 rounded-xl transition shadow-xs">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
            className="px-4 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md shadow-amber-500/20 flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white sm:w-44"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">Loading inventory...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <Flame className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-600">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const hasDiscount = p.discountType && p.discountType !== 'NONE' && parseFloat(p.discountValue) > 0;
            const inactive = p.productStatus === 'INACTIVE';
            return (
              <div key={p.id}
                className={`bg-white rounded-2xl border shadow-xs hover:shadow-md transition overflow-hidden flex flex-col ${inactive ? 'opacity-60 border-gray-200' : 'border-amber-100'}`}>
                {/* Image */}
                <div className="relative h-40 bg-amber-50 overflow-hidden">
                  {p.imageUrl ? (
                    <img src={getImageUrl(p.imageUrl)} alt={p.name}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-200">
                      <Flame className="w-10 h-10" />
                    </div>
                  )}
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                      {parseFloat(p.discountValue)}% OFF
                    </span>
                  )}
                  <div className="absolute top-2 right-2">
                    <StockBadge stock={p.availableStock} minLevel={p.minimumStockLevel} />
                  </div>
                </div>

                {/* Info */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="text-[10px] text-gray-400 font-mono">{p.productCode} · {p.category?.name}</div>
                    <h3 className="text-sm font-bold text-gray-900 mt-0.5 line-clamp-1">{p.name}</h3>
                    <div className="flex items-baseline space-x-1.5 mt-1">
                      <span className="text-base font-black text-amber-700">
                        ₹{parseFloat(p.finalSellingPrice || p.sellingPrice).toFixed(0)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through">₹{parseFloat(p.sellingPrice).toFixed(0)}</span>
                      )}
                    </div>
                  </div>

                  {/* Stock row */}
                  <div className="flex items-center justify-between text-xs bg-amber-50/60 rounded-lg px-2.5 py-1.5 border border-amber-100">
                    <span className="text-gray-500">Stock</span>
                    <span className="font-black text-gray-900">{p.availableStock} units</span>
                    <button
                      onClick={() => setAdjustProduct(p)}
                      className="p-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 transition"
                      title="Adjust Stock"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <button
                      onClick={() => handleToggle(p.id)}
                      className={`p-1.5 rounded-lg transition text-xs font-semibold flex items-center space-x-1 ${
                        inactive
                          ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-amber-600 hover:bg-amber-50'
                      }`}
                      title={inactive ? 'Activate' : 'Deactivate'}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{inactive ? 'Activate' : 'Active'}</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }}
                        className="p-1.5 text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={editingProduct}
        categories={categories}
        onSave={load}
      />

      <StockAdjustModal
        isOpen={!!adjustProduct}
        onClose={() => setAdjustProduct(null)}
        product={adjustProduct}
        onAdjustSuccess={load}
      />

      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Product"
        message={`Delete "${deleteTarget?.name}" from inventory? This cannot be undone.`}
        confirmText="Yes, Delete"
        confirmVariant="danger"
        loading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default InventoryPage;
