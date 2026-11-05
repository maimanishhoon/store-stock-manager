import React, { useState, useEffect } from 'react';
import { orderApi } from '../../api/orderApi';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import OrderDetailModal from '../../components/OrderDetailModal';
import {
  Inbox,
  Package,
  CheckCircle,
  Truck,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  CheckSquare,
  AlertCircle,
  Warehouse,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PackingDashboardPage = () => {
  const { user } = useAuth();
  const [queueOrders, setQueueOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getPackingQueue();
      setQueueOrders(data);
    } catch (err) {
      console.error('Error fetching packing queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();

    const handleOrderUpdate = () => {
      fetchQueue();
    };

    window.addEventListener('shop:orderUpdated', handleOrderUpdate);
    return () => {
      window.removeEventListener('shop:orderUpdated', handleOrderUpdate);
    };
  }, []);

  const handleQuickStatus = async (orderId, newStatus) => {
    try {
      setActionLoading(true);
      await orderApi.updateOrderStatus(orderId, { status: newStatus });
      fetchQueue();
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const newOrders = queueOrders.filter((o) => o.status === 'PENDING' || o.status === 'APPROVED');
  const acceptedOrders = queueOrders.filter((o) => o.status === 'ACCEPTED');
  const packingOrders = queueOrders.filter((o) => o.status === 'PACKING');
  const readyOrders = queueOrders.filter((o) => o.status === 'READY');
  const dispatchedOrders = queueOrders.filter((o) => o.status === 'DISPATCHED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-amber-800 via-orange-800 to-red-800 p-6 rounded-3xl text-white shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-orange-200 text-xs font-semibold uppercase tracking-wider">
            <Warehouse className="w-4 h-4" />
            <span>Warehouse Fulfillment Terminal</span>
          </div>
          <h1 className="text-2xl font-black mt-1">
            Welcome, {user?.fullName || 'Packing Team'}
          </h1>
          <p className="text-xs text-orange-100 mt-1 max-w-xl">
            Live order queue from the shop counter. Review items, accept requests, pack safely, and notify the counter when ready.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-xs transition self-start sm:self-auto flex items-center space-x-2 text-xs font-bold border border-white/20"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Orders</span>
        </button>
      </div>

      {/* 4 Packing Status Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Incoming</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 mt-2">{newOrders.length}</div>
          <p className="text-[11px] text-gray-500 mt-1">Awaiting staff acceptance</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">In Packing</span>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 mt-2">
            {acceptedOrders.length + packingOrders.length}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Currently being assembled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ready at Counter</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 mt-2">{readyOrders.length}</div>
          <p className="text-[11px] text-gray-500 mt-1">Awaiting customer collection</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dispatched</span>
            <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 mt-2">{dispatchedOrders.length}</div>
          <p className="text-[11px] text-gray-500 mt-1">Dispatched from warehouse</p>
        </div>
      </div>

      {/* Active Packing Queue Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Active Packing Queue</h2>
            <p className="text-xs text-gray-500">Orders requiring immediate action from packing staff</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-gray-400">Loading packing queue...</div>
        ) : queueOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs">
            <CheckSquare className="w-12 h-12 text-teal-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">All caught up!</h3>
            <p className="text-xs text-gray-500 mt-1">
              There are currently no active packing requests in queue. New orders from counter will appear automatically via WebSocket.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {queueOrders.map((order) => {
              const isPending = order.status === 'PENDING' || order.status === 'APPROVED';
              const isAccepted = order.status === 'ACCEPTED';
              const isPacking = order.status === 'PACKING';
              const isReady = order.status === 'READY';
              const isDispatched = order.status === 'DISPATCHED';

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border ${
                    isPending
                      ? 'border-amber-300 ring-2 ring-amber-100 shadow-md'
                      : isPacking
                      ? 'border-indigo-300 ring-2 ring-indigo-50 shadow-sm'
                      : 'border-gray-200/80 shadow-xs'
                  } p-5 flex flex-col justify-between transition hover:shadow-md`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Order Number & Status */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-base font-black text-gray-900 font-mono tracking-tight">
                          {order.orderNumber}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center mt-0.5">
                          <Clock className="w-3 h-3 mr-1" />
                          {order.orderDate ? new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </div>
                      </div>
                      <StatusBadge status={order.status} size="sm" />
                    </div>

                    {/* Requester & Notes */}
                    <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Requested by:</span>
                        <span className="font-semibold text-gray-800">{order.requestedBy}</span>
                      </div>
                      {order.customerName && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Customer:</span>
                          <span className="font-bold text-amber-800">👤 {order.customerName}</span>
                        </div>
                      )}
                      {order.customerPhone && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Mobile:</span>
                          <span className="font-semibold text-gray-800">{order.customerPhone}</span>
                        </div>
                      )}
                      {order.packingStaff && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Assigned:</span>
                          <span className="font-semibold text-orange-800">{order.packingStaff}</span>
                        </div>
                      )}
                      {order.notes && (
                        <div className="pt-1 border-t border-gray-200/60 text-[11px] text-amber-800">
                          <strong>Note:</strong> {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Packing Items Preview */}
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex justify-between">
                        <span>Items to Pack</span>
                        <span>{order.items?.length || 0} product(s)</span>
                      </div>
                      <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl max-h-40 overflow-y-auto bg-gray-50/40">
                        {order.items?.map((item) => (
                          <div key={item.id} className="p-2 flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-800 line-clamp-1 mr-2">
                              {item.productName}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-900 text-white font-bold rounded-md text-[11px] font-mono flex-shrink-0">
                              × {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                    >
                      Details
                    </button>

                    {isPending && (
                      <button
                        onClick={() => handleQuickStatus(order.id, 'ACCEPTED')}
                        disabled={actionLoading}
                        className="flex-1 px-3 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition flex items-center justify-center space-x-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Accept Request</span>
                      </button>
                    )}

                    {isAccepted && (
                      <button
                        onClick={() => handleQuickStatus(order.id, 'PACKING')}
                        disabled={actionLoading}
                        className="flex-1 px-3 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition flex items-center justify-center space-x-1"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Start Packing</span>
                      </button>
                    )}

                    {isPacking && (
                      <button
                        onClick={() => handleQuickStatus(order.id, 'READY')}
                        disabled={actionLoading}
                        className="flex-1 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center justify-center space-x-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Mark Order Ready</span>
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => handleQuickStatus(order.id, 'DISPATCHED')}
                        disabled={actionLoading}
                        className="flex-1 px-3 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition flex items-center justify-center space-x-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Mark Dispatched</span>
                      </button>
                    )}

                    {isDispatched && (
                      <span className="text-xs text-teal-700 font-semibold italic">
                        Waiting Counter Handover
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onOrderUpdated={fetchQueue}
      />
    </div>
  );
};

export default PackingDashboardPage;
