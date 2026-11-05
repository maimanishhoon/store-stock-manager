import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Inbox,
  CheckSquare,
  Package,
  PackageCheck,
  Truck,
  LogOut,
  ArrowRight,
  Warehouse,
} from 'lucide-react';

const packingNavItems = [
  { name: 'Dashboard', path: '/packing', icon: LayoutDashboard },
  { name: 'New Orders', path: '/packing/orders?status=PENDING', icon: Inbox },
  { name: 'Accepted Orders', path: '/packing/orders?status=ACCEPTED', icon: CheckSquare },
  { name: 'Packing', path: '/packing/orders?status=PACKING', icon: Package },
  { name: 'Ready Orders', path: '/packing/orders?status=READY', icon: PackageCheck },
  { name: 'Dispatched Orders', path: '/packing/orders?status=DISPATCHED', icon: Truck },
];

const PackingSidebar = ({ isOpen, closeSidebar }) => {
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-gray-900/40 z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-gradient-to-b from-orange-950 to-red-950 border-r border-orange-800/50 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="p-4 space-y-6">
          <div className="px-3 pt-2 flex items-center space-x-2">
            <Warehouse className="w-4 h-4 text-orange-400" />
            <span className="text-[11px] uppercase tracking-wider text-orange-400 font-bold">
              📦 Warehouse Packing Dept
            </span>
          </div>

          <nav className="space-y-1">
            {packingNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/packing'}
                  onClick={() => closeSidebar && closeSidebar()}
                  className={({ isActive }) =>
                    `flex items-center px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-sm diya-glow'
                        : 'text-orange-200 hover:text-white hover:bg-orange-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 mr-3" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User status & Logout */}
        <div className="p-4 border-t border-orange-800/50 space-y-2">
          <div className="bg-orange-900/50 p-3 rounded-lg border border-orange-700/50 text-xs text-orange-300">
            <div className="text-orange-400 font-semibold mb-0.5">Packing Staff Mode</div>
            <div className="text-orange-400/80">Only order fulfillment actions permitted. Prices & inventory settings locked.</div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-sm font-medium text-rose-300 hover:bg-rose-900/40 hover:text-rose-200 transition"
          >
            <div className="flex items-center">
              <LogOut className="w-4 h-4 mr-3" />
              <span>Logout</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default PackingSidebar;
