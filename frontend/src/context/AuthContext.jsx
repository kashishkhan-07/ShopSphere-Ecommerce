import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user session on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('shopsphere_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setVendor(res.data.vendor);
        }
      } catch (err) {
        localStorage.removeItem('shopsphere_token');
        setUser(null);
        setVendor(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('shopsphere_token', res.data.token);
      setUser(res.data.user);
      setVendor(res.data.vendor);
      return res.data;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      localStorage.setItem('shopsphere_token', res.data.token);
      setUser(res.data.user);
      setVendor(res.data.vendor);
      return res.data;
    }
  };

  // 1-Click Demo Account Switcher
  const demoLogin = async (role) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/demo-login', { role });
      if (res.data.success) {
        localStorage.setItem('shopsphere_token', res.data.token);
        setUser(res.data.user);
        setVendor(res.data.vendor);
      }
    } catch (err) {
      console.error('Demo login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('shopsphere_token');
      setUser(null);
      setVendor(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        vendor,
        loading,
        login,
        register,
        demoLogin,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isVendor: user?.role === 'vendor',
        isCustomer: user?.role === 'customer',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);