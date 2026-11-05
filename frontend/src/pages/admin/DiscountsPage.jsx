import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import DiscountModal from '../../components/DiscountModal';
import {
  BadgePercent,
  Search,
  Tag,
  DollarSign,
  Edit2,
  Trash2,
  Sparkles,
  RefreshCw,
  Plus,
} from 'lucide-react';

const DiscountsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'DISCOUNTED' | 'NO_DISCOUNT'

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products for discounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.productCode.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === 'DISCOUNTED') return p.discountType && p.discountType !== 'NONE';
    if (filterType === 'NO_DISCOUNT') return !p.discountType || p.discountType === 'NONE';
    return true;
  });

  const discountedCount = products.filter((p) => p.discountType && p.discountType !== 'NONE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Price & Discount Management</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
              {discountedCount} Active Discounts
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Configure Diwali festive deals, percentage off, or flat price reductions without impacting inventory stocks
          </p>
        </div>

        <button
          onClick={fetchProducts}
          className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products to discount..."
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'ALL'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setFilterType('DISCOUNTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1 ${
              filterType === 'DISCOUNTED'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discounted Only ({discountedCount})</span>
          </button>
          <button
            onClick={() => setFilterType('NO_DISCOUNT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'NO_DISCOUNT'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Regular Price Only
          </button>
        </div>
      </div>

      {/* Discounts Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5 text-left font-semibold">Product</th>
                <th className="px-4 py-3.5 text-left font-semibold">Category</th>
                <th className="px-4 py-3.5 text-right font-semibold">Original Selling Price</th>
                <th className="px-4 py-3.5 text-center font-semibold">Discount Type</th>
                <th className="px-4 py-3.5 text-center font-semibold">Discount Value</th>
                <th className="px-4 py-3.5 text-right font-semibold">Final Selling Price</th>
                <th className="px-4 py-3.5 text-right font-semibold">Savings</th>
                <th className="px-6 py-3.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-400">
                    No products matching filter.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const sp = parseFloat(p.sellingPrice) || 0;
                  const fsp = parseFloat(p.finalSellingPrice) || 0;
                  const savings = Math.max(0, sp - fsp);
                  const isDiscounted = p.discountType && p.discountType !== 'NONE';

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-3.5 font-medium text-gray-900">
                        {p.name}
                        <span className="block text-[10px] text-gray-400 font-mono">
                          {p.productCode}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">
                        {p.category?.name}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-gray-700">
                        ₹{sp.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {isDiscounted ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {p.discountType}
                          </span>
                        ) : (
                          <span className="text-gray-400">Regular</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center font-semibold font-mono text-amber-700">
                        {isDiscounted ? (
                          p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : `₹${p.discountValue}`
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-emerald-800 font-mono text-sm">
                        ₹{fsp.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-emerald-600 font-mono">
                        {savings > 0 ? `₹${savings.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setIsModalOpen(true);
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition inline-flex items-center space-x-1 ${
                            isDiscounted
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <BadgePercent className="w-3.5 h-3.5" />
                          <span>{isDiscounted ? 'Modify Deal' : 'Add Discount'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DiscountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onDiscountUpdated={fetchProducts}
      />
    </div>
  );
};

export default DiscountsPage;
