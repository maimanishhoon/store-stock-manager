import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import { orderApi } from '../../api/orderApi';
import { productApi } from '../../api/productApi';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import StockBadge from '../../components/StockBadge';
import CreateOrderModal from '../../components/CreateOrderModal';
import OrderDetailModal from '../../components/OrderDetailModal';
import {
  Boxes,
  Layers,
  Clock,
  PackageCheck,
  AlertTriangle,
  Plus,
  Eye,
  RefreshCw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData, lowStockData, productsData, catsData] = await Promise.all([
        dashboardApi.getStats(),
        orderApi.getOrders(),
        productApi.getProducts(),
        productApi.getProducts(),
        productApi.getCategories(),
      ]);

      setStats(statsData);
      setRecentOrders(ordersData.slice(0, 6));
      setLowStockProducts(lowStockData.filter((p) => p.availableStock <= p.minimumStockLevel));
      setAllProducts(productsData);
      setCategories(catsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Listen to real-time WebSocket order update events
    const handleOrderUpdate = () => {
      loadDashboardData();
    };

    window.addEventListener('shop:orderUpdated', handleOrderUpdate);
    return () => {
      window.removeEventListener('shop:orderUpdated', handleOrderUpdate);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Counter Admin Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time shop counter overview & packing synchronization
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadDashboardData}
            title="Refresh"
            className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/admin/inventory"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition shadow-xs flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-gray-500" />
            <span>Add Product</span>
          </Link>

          <button
            onClick={() => setIsCreateOrderOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Packing Request</span>
          </button>
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          subtitle="In Catalog"
          icon={Boxes}
          color="blue"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          subtitle="Packing queue"
          icon={Clock}
          color="amber"
          alert={(stats?.pendingOrders || 0) > 0}
        />
        <StatCard
          title="Available Stock"
          value={stats?.totalAvailableStock || 0}
          subtitle="Physical units ready"
          icon={Layers}
          color="emerald"
          className="hidden sm:block"
        />
        <StatCard
          title="Ready for Delivery"
          value={stats?.ordersReadyForDelivery || 0}
          subtitle="At pickup counter"
          icon={PackageCheck}
          color="purple"
          className="hidden sm:block"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockProducts || 0}
          subtitle="At or below minimum"
          icon={AlertTriangle}
          color="rose"
          alert={(stats?.lowStockProducts || 0) > 0}
          className="hidden sm:block"
        />
      </div>

      {/* Low stock alerts banner if any */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                {lowStockProducts.length} Product{lowStockProducts.length > 1 ? 's' : ''} Running Low on Stock
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Restock before peak Diwali rush: {lowStockProducts.slice(0, 3).map((p) => p.name).join(', ')}
                {lowStockProducts.length > 3 ? ` and ${lowStockProducts.length - 3} more` : ''}.
              </p>
            </div>
          </div>
          <Link
            to="/admin/inventory"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition flex items-center space-x-1 flex-shrink-0"
          >
            <span>Restock Inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Recent Orders & Fulfillment Status */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Recent Packing Orders</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Live status synchronized with warehouse packing staff
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50/70 text-gray-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Order Number</th>
                <th className="px-4 py-3 text-left font-semibold">Date & Time</th>
                <th className="px-4 py-3 text-left font-semibold">Items Count</th>
                <th className="px-4 py-3 text-left font-semibold">Assigned Staff</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-6 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    No orders placed yet. Click "New Packing Request" to create one.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-6 py-3.5 font-bold text-gray-900 font-mono">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">
                      {order.orderDate ? new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700">
                      {order.items?.length || 0} product(s)
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">
                      {order.packingStaff || <span className="text-gray-400 italic">Unclaimed</span>}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-gray-900 font-mono">
                      ₹{parseFloat(order.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateOrderModal
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        products={allProducts}
        onOrderCreated={loadDashboardData}
      />

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onOrderUpdated={loadDashboardData}
      />
    </div>
  );
};

export default AdminDashboardPage;
