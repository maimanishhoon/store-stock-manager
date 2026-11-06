import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, Package, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await login(username.trim(), password);
      if (res.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/packing');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Invalid credentials. Please verify username and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-950 via-orange-900 to-red-900 p-4 relative overflow-hidden">
      {/* Decorative background diyas */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-8 left-8 text-5xl opacity-20">🪔</div>
        <div className="absolute top-16 right-12 text-4xl opacity-15">✨</div>
        <div className="absolute bottom-12 left-16 text-4xl opacity-15">🎆</div>
        <div className="absolute bottom-8 right-8 text-5xl opacity-20">🪔</div>
        <div className="absolute top-1/2 left-4 text-3xl opacity-10">🌸</div>
        <div className="absolute top-1/3 right-4 text-3xl opacity-10">🌸</div>
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-amber-200/60 p-8 sm:p-10 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-500/30 mb-4">
            <span className="text-3xl">🪔</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Diwali Shop Manager
          </h1>
          <p className="text-sm text-amber-700 font-medium mt-1">
            Seasonal Inventory & Real-Time Packing System
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Quick-Login Buttons */}
        <div className="mb-6 p-3 bg-amber-50 rounded-2xl border border-amber-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-2 text-center">
            Quick Demo Login Accounts
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                username === 'admin'
                  ? 'border-amber-600 bg-amber-100 text-amber-900 ring-2 ring-amber-200'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-amber-50'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Shop Admin</span>
            </button>

            <button
              type="button"
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                username === 'packer'
                  ? 'border-orange-600 bg-orange-100 text-orange-900 ring-2 ring-orange-200'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-orange-50'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-orange-600" />
              <span>Packing Staff</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 focus:ring-4 focus:ring-amber-200 transition shadow-md shadow-amber-500/30 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to System</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-amber-100 text-center text-xs text-amber-600 font-medium">
          🪔 Diwali Retail & Packing Management v1.0
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
