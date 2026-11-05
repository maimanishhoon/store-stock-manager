import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  ClipboardList,
  Bell,
  LogOut,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Inventory', path: '/admin/inventory', icon: Layers },
  { name: 'Orders', path: '/admin/orders', icon: ClipboardList },
  { name: 'Notifications', path: '/admin/notifications', icon: Bell },
];

const Sidebar = ({ isOpen, closeSidebar }) => {
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
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-gradient-to-b from-amber-950 to-orange-950 border-r border-amber-800/50 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="p-4 space-y-6">
          {/* Section title */}
          <div className="px-3 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              🪔 Admin Counter Portal
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={() => closeSidebar && closeSidebar()}
                  className={({ isActive }) =>
                    `flex items-center px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-sm diya-glow'
                        : 'text-amber-200 hover:text-white hover:bg-amber-800/50'
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
        <div className="p-4 border-t border-amber-800/50 space-y-2">
          <div className="bg-amber-900/50 p-3 rounded-lg border border-amber-700/50 text-xs text-amber-300">
            <div className="flex items-center space-x-1.5 text-amber-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diwali Festive Season</span>
            </div>
            <span className="text-amber-400/80">Internal Counter Management System</span>
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

export default Sidebar;
