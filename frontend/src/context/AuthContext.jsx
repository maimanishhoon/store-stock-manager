import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('diwali_shop_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('diwali_shop_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('diwali_shop_token');
      if (storedToken) {
        try {
          const profile = await authApi.getCurrentUser();
          setUser(profile);
          localStorage.setItem('diwali_shop_user', JSON.stringify(profile));
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const data = await authApi.login({ username, password });
    setToken(data.token);
    setUser({
      id: data.id,
      username: data.username,
      fullName: data.fullName,
      role: data.role,
    });
    localStorage.setItem('diwali_shop_token', data.token);
    localStorage.setItem(
      'diwali_shop_user',
      JSON.stringify({
        id: data.id,
        username: data.username,
        fullName: data.fullName,
        role: data.role,
      })
    );
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('diwali_shop_token');
    localStorage.removeItem('diwali_shop_user');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isPackingStaff = user?.role === 'PACKING_STAFF';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: user?.role,
        isAdmin,
        isPackingStaff,
        isAuthenticated: !!token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
