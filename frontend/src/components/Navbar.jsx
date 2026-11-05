import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Sparkles, Bell, LogOut, User, Menu, X, Shield, Package, QrCode } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, role, logout } = useAuth();
  const { unreadCount } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-amber-900 via-orange-900 to-amber-900 border-b border-amber-700/60 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-amber-200 hover:text-white hover:bg-amber-800/60 lg:hidden focus:outline-none"
            aria-label="Toggle navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/30">
              <span className="text-xl">🪔</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-white tracking-tight">Diwali Shop</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/30 text-amber-100 border border-amber-500/40">
                  Manager
                </span>
              </div>
              <p className="text-[11px] text-amber-300 hidden sm:block">
                Seasonal Inventory & Packing System
              </p>
            </div>
          </div>
        </div>

        {/* Right: Real-time Status, Notifications, User info & Logout */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Customer Storefront Link */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-amber-400/50 bg-amber-500/20 text-amber-100 text-xs font-semibold hover:bg-amber-500/30 transition"
            title="Open In-Store Customer Storefront"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Store</span>
          </a>

          {/* Live indicator */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Live Sync</span>
          </div>

          {/* Role badge */}
          <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-800/50 text-amber-100 border border-amber-600/40">
            {role === 'ADMIN' ? (
              <>
                <Shield className="w-3.5 h-3.5 text-amber-300" />
                <span>Shop Counter</span>
              </>
            ) : (
              <>
                <Package className="w-3.5 h-3.5 text-orange-300" />
                <span>Packing Staff</span>
              </>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative p-2 text-amber-200 hover:text-white hover:bg-amber-800/60 rounded-lg transition"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold ring-2 ring-amber-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationDropdown
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>

          {/* User profile & Logout */}
          <div className="flex items-center space-x-2 pl-2 border-l border-amber-700/60">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-semibold text-white leading-tight">
                {user?.fullName || user?.username}
              </div>
              <div className="text-[10px] text-amber-300 font-medium">
                @{user?.username}
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-amber-300 hover:text-rose-300 hover:bg-rose-900/40 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
