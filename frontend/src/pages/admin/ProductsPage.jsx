import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import { getImageUrl } from '../../utils/imageUrl';
import ProductModal from '../../components/ProductModal';
import DiscountModal from '../../components/DiscountModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import StockBadge from '../../components/StockBadge';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  BadgePercent,
  Power,
  Grid,
  List,
  Sparkles,
  Info,
  Tag,
} from 'lucide-react';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountProduct, setDiscountProduct] = useState(null);

  const [deleteProductTarget, setDeleteProductTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery.trim()) params.query = searchQuery.trim();
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;

      const [prods, cats] = await Promise.all([
        productApi.getProducts(params),
        productApi.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, selectedStatus]);

  const handleToggleStatus = async (productId) => {
    try {
      await productApi.toggleStatus(productId);
      fetchProducts();
    } catch (err) {
      alert('Failed to toggle status: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProductTarget) return;
    try {
      setIsDeleting(true);
      await productApi.deleteProduct(deleteProductTarget.id);
      setDeleteProductTarget(null);
      fetchProducts();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Product Management</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage Diwali inventory catalog, seasonal pricing, discounts, and item specifications
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center space-x-1.5 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Safety & Compliance Notice */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Inventory Compliance Notice:</strong> Firecracker items in this catalog are internal inventory records only for shop counter management and packing verification. Online retail checkout and shipping are disabled.
        </div>
      </div>

      {/* Search, Filter Bar & View Toggle */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name or SKU code..."
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-36">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-1 border border-gray-200 p-1 rounded-xl bg-gray-50 self-end md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'grid' ? 'bg-white shadow-xs text-emerald-700' : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Grid Cards View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'table' ? 'bg-white shadow-xs text-emerald-700' : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Table List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Content: Grid or Table */}
      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400">Loading Diwali catalog...</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80">
          <Boxes className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">No products found</h3>
          <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => {
            const hasDiscount = product.discountType && product.discountType !== 'NONE';
            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl border ${
                  product.productStatus === 'INACTIVE' ? 'opacity-65 border-gray-200' : 'border-gray-200/80'
                } shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between`}
              >
                <div>
                  {/* Image & Badges Header */}
                  <div className="relative h-44 bg-gray-100 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={getImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=60';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                        <Sparkles className="w-8 h-8 opacity-40" />
                      </div>
                    )}

                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-900/80 backdrop-blur-xs text-white">
                        {product.category?.name || 'Festive'}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <StockBadge stock={product.availableStock} minLevel={product.minimumStockLevel} />
                    </div>

                    {hasDiscount && (
                      <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
                        {product.discountType === 'PERCENTAGE'
                          ? `${product.discountValue}% OFF`
                          : `₹${product.discountValue} OFF`}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-gray-400 font-semibold">{product.productCode}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          product.productStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.productStatus}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px]">
                      {product.description || 'Festive Diwali retail collection product.'}
                    </p>

                    {/* Pricing */}
                    <div className="pt-2 border-t border-gray-100 flex items-baseline justify-between">
                      <div>
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-lg font-black text-emerald-800 font-mono">
                            ₹{parseFloat(product.finalSellingPrice).toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through font-mono">
                              ₹{parseFloat(product.sellingPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400">
                          Cost: ₹{parseFloat(product.purchasePrice || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setDiscountProduct(product);
                        setIsDiscountModalOpen(true);
                      }}
                      className="p-1.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title="Manage Discount"
                    >
                      <BadgePercent className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(product.id)}
                      className={`p-1.5 rounded-lg transition ${
                        product.productStatus === 'ACTIVE'
                          ? 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={product.productStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setIsProductModalOpen(true);
                      }}
                      className="p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteProductTarget(product)}
                      className="p-1.5 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Product</th>
                  <th className="px-4 py-3 text-left font-semibold">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-right font-semibold">Cost</th>
                  <th className="px-4 py-3 text-right font-semibold">Original Price</th>
                  <th className="px-4 py-3 text-right font-semibold">Final Price</th>
                  <th className="px-4 py-3 text-center font-semibold">Stock</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-900 flex items-center space-x-3">
                      <img
                        src={getImageUrl(product.imageUrl) || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=60'}
                        alt={product.name}
                        className="w-9 h-9 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                      />
                      <span className="line-clamp-1">{product.name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono font-medium">
                      {product.productCode}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {product.category?.name}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 font-mono">
                      ₹{parseFloat(product.purchasePrice || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 font-mono">
                      ₹{parseFloat(product.sellingPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-800 font-mono">
                      ₹{parseFloat(product.finalSellingPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StockBadge stock={product.availableStock} minLevel={product.minimumStockLevel} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          product.productStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.productStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => {
                            setDiscountProduct(product);
                            setIsDiscountModalOpen(true);
                          }}
                          className="p-1 text-gray-500 hover:text-amber-600 rounded"
                          title="Discount"
                        >
                          <BadgePercent className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setIsProductModalOpen(true);
                          }}
                          className="p-1 text-gray-500 hover:text-emerald-600 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteProductTarget(product)}
                          className="p-1 text-gray-500 hover:text-rose-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={editingProduct}
        categories={categories}
        onSave={fetchProducts}
      />

      {/* Discount Modal */}
      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        product={discountProduct}
        onDiscountUpdated={fetchProducts}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteProductTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteProductTarget?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete Product"
        confirmVariant="danger"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteProductTarget(null)}
      />
    </div>
  );
};

export default ProductsPage;
