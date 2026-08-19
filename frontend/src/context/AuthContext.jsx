import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shopsphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [vendor, setVendor] = useState(() => {
    const saved = localStorage.getItem('shopsphere_vendor');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe();
  }, []);

  const fetchMe = async () => {
    const token = localStorage.getItem('shopsphere_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      if (data.vendor) setVendor(data.vendor);
      localStorage.setItem('shopsphere_user', JSON.stringify(data.user));
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('shopsphere_token', data.token);
    localStorage.setItem('shopsphere_user', JSON.stringify(data.user));
    setUser(data.user);
    await fetchMe();
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('shopsphere_token', data.token);
    localStorage.setItem('shopsphere_user', JSON.stringify(data.user));
    setUser(data.user);
    await fetchMe();
    return data;
  };

  // 🔄 Update Local & State User
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('shopsphere_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    localStorage.removeItem('shopsphere_token');
    localStorage.removeItem('shopsphere_user');
    localStorage.removeItem('shopsphere_vendor');
    setUser(null);
    setVendor(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        vendor,
        loading,
        isAuthenticated: !!user,
        isVendor: user?.role === 'vendor',
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUser,
        fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);