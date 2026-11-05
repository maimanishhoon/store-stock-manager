import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PackingSidebar from './components/PackingSidebar';
import Toast from './components/Toast';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import InventoryPage from './pages/admin/InventoryPage';
import OrdersPage from './pages/admin/OrdersPage';
import NotificationsPage from './pages/admin/NotificationsPage';

import PackingDashboardPage from './pages/packing/PackingDashboardPage';
import PackingOrdersPage from './pages/packing/PackingOrdersPage';
import CustomerStorePage from './pages/customer/CustomerStorePage';

// Protected Route Component
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
        Authenticating...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect based on user's actual role
    return <Navigate to={role === 'ADMIN' ? '/admin' : '/packing'} replace />;
  }

  return <Outlet />;
};

// Admin Layout
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-amber-50/40 flex flex-col">
      <Navbar
        toggleSidebar={() => setSidebarOpen((prev) => !prev)}
        isSidebarOpen={sidebarOpen}
      />
      <div className="flex-1 flex">
        <Sidebar
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:pl-72 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Packing Layout
const PackingLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-orange-50/40 flex flex-col">
      <Navbar
        toggleSidebar={() => setSidebarOpen((prev) => !prev)}
        isSidebarOpen={sidebarOpen}
      />
      <div className="flex-1 flex">
        <PackingSidebar
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:pl-72 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  const { isAuthenticated, role, loading } = useAuth();

  return (
    <>
      <Toast />
      <Routes>
        {/* Public In-Store Customer QR Routes */}
        <Route path="/" element={<CustomerStorePage />} />
        <Route path="/shop" element={<CustomerStorePage />} />

        {/* Public Login Route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={role === 'ADMIN' ? '/admin' : '/packing'} replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* Admin Dashboard Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/inventory" element={<InventoryPage />} />
            <Route path="/admin/orders" element={<OrdersPage />} />
            <Route path="/admin/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        {/* Packing Dashboard Routes */}
        <Route element={<ProtectedRoute allowedRoles={['PACKING_STAFF', 'ADMIN']} />}>
          <Route element={<PackingLayout />}>
            <Route path="/packing" element={<PackingDashboardPage />} />
            <Route path="/packing/orders" element={<PackingOrdersPage />} />
          </Route>
        </Route>

        {/* Fallback Root Redirect */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to={role === 'ADMIN' ? '/admin' : '/packing'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
