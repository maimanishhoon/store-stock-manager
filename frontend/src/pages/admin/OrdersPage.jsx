import React, { useState, useEffect } from 'react';
import { orderApi } from '../../api/orderApi';
import { productApi } from '../../api/productApi';
import StatusBadge from '../../components/StatusBadge';
import CreateOrderModal from '../../components/CreateOrderModal';
import OrderDetailModal from '../../components/OrderDetailModal';
import ApproveOrderModal from '../../components/ApproveOrderModal';
import BehalfOrderModal from '../../components/BehalfOrderModal';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Eye,
  RefreshCw,
  CheckCircle,
  Truck,
  Sparkles,
  Package,
  Phone,
  Banknote,
  AlertCircle,
} from 'lucide-react';

const statuses = [
  { label: 'All Orders', value: '' },
  { label: '🔔 Customer QR (Awaiting Approval)', value: 'PENDING_APPROVAL' },
  { label: 'Approved (Warehouse Queue)', value: 'APPROVED' },
  { label: 'Internal Orders', value: 'PENDING' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Packing In Progress', value: 'PACKING' },
  { label: 'Ready for Collection', value: 'READY' },
  { label: 'Dispatched', value: 'DISPATCHED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBehalfOpen, setIsBehalfOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [approvingOrder, setApprovingOrder] = useState(null);

  const pendingApprovalCount = orders.filter((o) => o.status === 'PENDING_APPROVAL').length;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [orderList, prodList] = await Promise.all([
        orderApi.getOrders(selectedStatus || null),
        productApi.getProducts(),
      ]);
      setOrders(orderList);
      setProducts(prodList);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleOrderUpdate = () => {
      fetchOrders();
    };

    window.addEventListener('shop:orderUpdated', handleOrderUpdate);
    return () => {
      window.removeEventListener('shop:orderUpdated', handleOrderUpdate);
    };
  }, [selectedStatus]);

  const filteredOrders = orders.filter((o) => {
    const s = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(s) ||
      (o.packingStaff && o.packingStaff.toLowerCase().includes(s)) ||
      o.requestedBy.toLowerCase().includes(s) ||
      (o.customerPhone && o.customerPhone.includes(s)) ||
      (o.customerName && o.customerName.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Pending Customer Approvals Alert Banner */}
      {pendingApprovalCount > 0 && (
        <div className="p-4 rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black">
                {pendingApprovalCount} Customer QR Order{pendingApprovalCount > 1 ? 's' : ''} Awaiting Review & Billing
              </h3>
              <p className="text-xs text-amber-100">
                Customers placed orders on mobile. Click "Review & Bill" to apply discounts, record payment (Cash/Online/Skip), and dispatch to warehouse!
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedStatus('PENDING_APPROVAL')}
            className="px-4 py-2 bg-white text-amber-900 rounded-xl text-xs font-black shadow-sm hover:bg-amber-50 transition shrink-0 ml-3"
          >
            View Pending Orders
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Order Management</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              {orders.length} Requests
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Create internal packing orders for warehouse staff and track fulfillment progress
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition shadow-xs"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsBehalfOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center space-x-1.5 transition"
          >
            <Phone className="w-4 h-4" />
            <span>Place Order (On Behalf)</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Internal Packing Request</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
        {/* Status Scroll Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {statuses.map((st) => (
            <button
              key={st.value}
              onClick={() => setSelectedStatus(st.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedStatus === st.value
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number, requester, or packing staff..."
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table - desktop / Cards - mobile */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Mobile Cards */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="p-6 text-center text-gray-400 text-sm">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No orders matching criteria.</div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 font-mono text-sm">{order.orderNumber}</span>
                  <StatusBadge status={order.status} size="sm" />
                </div>
                {order.customerName && (
                  <div className="text-xs font-bold text-amber-800">👤 {order.customerName} · {order.customerPhone}</div>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{order.items?.length || 0} items</span>
                  <span className="font-bold text-gray-900">₹{parseFloat(order.finalPayableAmount || order.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="pt-1">
                  {order.status === 'PENDING_APPROVAL' ? (
                    <button onClick={() => setApprovingOrder(order)}
                      className="w-full py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" /><span>Review & Bill</span>
                    </button>
                  ) : (
                    <button onClick={() => setSelectedOrder(order)}
                      className="w-full py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center space-x-1">
                      <Eye className="w-3.5 h-3.5" /><span>Manage</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5 text-left font-semibold">Order Number</th>
                <th className="px-4 py-3.5 text-left font-semibold">Date & Time</th>
                <th className="px-4 py-3.5 text-left font-semibold">Customer</th>
                <th className="px-4 py-3.5 text-left font-semibold">Packing Staff</th>
                <th className="px-4 py-3.5 text-center font-semibold">Items</th>
                <th className="px-4 py-3.5 text-center font-semibold">Status</th>
                <th className="px-4 py-3.5 text-right font-semibold">Order Value</th>
                <th className="px-6 py-3.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="8" className="px-6 py-10 text-center text-gray-400">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-10 text-center text-gray-400">No orders matching criteria.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-3.5 font-bold text-gray-900 font-mono">{order.orderNumber}</td>
                    <td className="px-4 py-3.5 text-gray-500">
                      {order.orderDate ? new Date(order.orderDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-700">
                      {order.customerPhone ? (
                        <div>
                          <div className="font-bold text-gray-900 flex items-center">
                            <Phone className="w-3 h-3 text-emerald-600 mr-1" />
                            <span>{order.customerPhone}</span>
                          </div>
                          <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                            👤 {order.customerName || 'Unknown'}
                          </div>
                        </div>
                      ) : (
                        order.requestedBy
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">
                      {order.packingStaff ? (
                        <span className="font-semibold text-teal-800">{order.packingStaff}</span>
                      ) : (
                        <span className="text-gray-400 italic">Unclaimed</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center text-gray-700">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 font-semibold">{order.items?.length || 0} items</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge status={order.status} size="sm" />
                      {order.paymentType && (
                        <div className="text-[10px] text-gray-500 mt-0.5 font-semibold">
                          Pay: <span className="text-gray-800">{order.paymentType}</span> ({order.paymentStatus || 'PENDING'})
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-emerald-800 font-mono">
                      <div>₹{parseFloat(order.finalPayableAmount || order.totalAmount || 0).toFixed(2)}</div>
                      {order.counterDiscountAmount > 0 && (
                        <div className="text-[10px] text-amber-700 font-semibold">-₹{parseFloat(order.counterDiscountAmount).toFixed(0)} off</div>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {order.status === 'PENDING_APPROVAL' ? (
                        <button onClick={() => setApprovingOrder(order)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm inline-flex items-center space-x-1 transition">
                          <Sparkles className="w-3.5 h-3.5" /><span>Review & Bill</span>
                        </button>
                      ) : (
                        <button onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 transition inline-flex items-center space-x-1">
                          <Eye className="w-3.5 h-3.5" /><span>Manage</span>
                        </button>
                      )}
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
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        products={products}
        onOrderCreated={fetchOrders}
      />

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onOrderUpdated={fetchOrders}
      />

      <ApproveOrderModal
        isOpen={!!approvingOrder}
        onClose={() => setApprovingOrder(null)}
        order={approvingOrder}
        onOrderApproved={fetchOrders}
      />

      <BehalfOrderModal
        isOpen={isBehalfOpen}
        onClose={() => setIsBehalfOpen(false)}
        products={products}
        onOrderCreated={fetchOrders}
      />
    </div>
  );
};

export default OrdersPage;
