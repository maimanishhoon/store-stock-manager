import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import StatusBadge from '../../components/StatusBadge';
import OrderDetailModal from '../../components/OrderDetailModal';
import {
  Inbox,
  CheckSquare,
  Package,
  PackageCheck,
  Truck,
  RefreshCw,
  Eye,
  Clock,
  User,
} from 'lucide-react';

const statusTitles = {
  PENDING: {
    title: 'New Incoming Orders',
    desc: 'Requests submitted by the shop counter awaiting acceptance',
    icon: Inbox,
  },
  ACCEPTED: {
    title: 'Accepted Orders',
    desc: 'Requests accepted by staff waiting for packing assembly',
    icon: CheckSquare,
  },
  PACKING: {
    title: 'Orders Being Packed',
    desc: 'Packing is actively in progress in warehouse',
    icon: Package,
  },
  READY: {
    title: 'Ready Orders',
    desc: 'Finished packing packages ready for shop counter pickup',
    icon: PackageCheck,
  },
  DISPATCHED: {
    title: 'Dispatched Orders',
    desc: 'Orders dispatched from the packing facility',
    icon: Truck,
  },
};

const PackingOrdersPage = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || 'PENDING';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getOrders(statusParam);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching packing orders:', err);
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
  }, [statusParam]);

  const currentInfo = statusTitles[statusParam] || {
    title: `${statusParam} Orders`,
    desc: 'Fulfillment orders by status',
    icon: Package,
  };
  const IconComponent = currentInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-teal-100 text-teal-800">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{currentInfo.title}</h1>
            <p className="text-xs text-gray-500 mt-0.5">{currentInfo.desc}</p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition shadow-xs self-start sm:self-auto flex items-center space-x-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5 text-left font-semibold">Order Number</th>
                <th className="px-4 py-3.5 text-left font-semibold">Order Time</th>
                <th className="px-4 py-3.5 text-left font-semibold">Requested By</th>
                <th className="px-4 py-3.5 text-left font-semibold">Staff Assigned</th>
                <th className="px-4 py-3.5 text-center font-semibold">Items</th>
                <th className="px-4 py-3.5 text-center font-semibold">Status</th>
                <th className="px-6 py-3.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-400">
                    No orders currently in this status.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-3.5 font-bold text-gray-900 font-mono">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">
                      {order.orderDate ? new Date(order.orderDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-700">
                      {order.requestedBy}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">
                      {order.packingStaff || <span className="text-gray-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-gray-700">
                      {order.items?.length || 0} product(s)
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Fulfill</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onOrderUpdated={fetchOrders}
      />
    </div>
  );
};

export default PackingOrdersPage;
