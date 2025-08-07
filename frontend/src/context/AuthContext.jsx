import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  if (token && userData && userData !== 'undefined') {
    try {
      setUser(JSON.parse(userData));
      api.setAuthToken(token);
    } catch (err) {
      console.error('Failed to parse user data from localStorage:', err);
      localStorage.removeItem('user'); // cleanup corrupted data
    }
  }

  setLoading(false);
}, []);

  const login = async (email, password) => {
  try {
    const response = await api.login(email, password);
    const { success, token, user: userData } = response.data;

    if (!success || !token || !userData) {
      throw new Error('Invalid login response');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    api.setAuthToken(token);
    setUser(userData);

    return { success: true };
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || 'Login failed',
    };
  }
};

 const register = async (name, email, password) => {
  try {
    const response = await api.register(name, email, password);
    console.log("Register API Response:", response.data); // 👈 ADD THIS
    const { success, error } = response.data;

    if (!success) {
      return {
        success: false,
        error: error || 'Registration failed',
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Registration failed',
    };
  }
};


  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    api.setAuthToken(null);
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};