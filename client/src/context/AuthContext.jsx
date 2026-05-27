import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const API_URL = 'http://localhost:5005/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState(() => {
    const saved = localStorage.getItem('current_location');
    return saved ? JSON.parse(saved) : { latitude: 6.8972, longitude: 79.8781, address: 'Polhengoda Road' };
  });

  // Sync currentLocation with user.location if user has it
  useEffect(() => {
    if (user && user.location && user.location.address) {
      setCurrentLocation(user.location);
      localStorage.setItem('current_location', JSON.stringify(user.location));
    }
  }, [user]);

  const updateLocation = async (loc) => {
    setCurrentLocation(loc);
    localStorage.setItem('current_location', JSON.stringify(loc));

    if (user && token) {
      try {
        const res = await axios.put(`${API_URL}/auth/location`, loc, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setUser(prev => ({ ...prev, location: res.data.location }));
        }
      } catch (err) {
        console.error('Failed to sync location with server:', err.message);
        setUser(prev => ({ ...prev, location: loc }));
      }
    } else if (user) {
      setUser(prev => ({ ...prev, location: loc }));
    }
  };

  // Set Authorization header for all requests
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  const fetchCurrentUser = async (jwtToken) => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Session persistence failed:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const checkUser = async (emailOrPhone) => {
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/check`, { emailOrPhone });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification check failed.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const otpLogin = async (emailOrPhone) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/otp-login`, { emailOrPhone });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verification failed.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (emailOrPhone, otp) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { emailOrPhone, otp });
      if (res.data.success && res.data.verified) {
        if (res.data.exists && res.data.token) {
          localStorage.setItem('token', res.data.token);
          setToken(res.data.token);
          setUser(res.data.user);
        }
        return res.data;
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verification failed.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateBalance = (newBalance) => {
    if (user) {
      setUser(prev => ({ ...prev, balance: newBalance }));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, checkUser, verifyOtp, otpLogin, logout, updateBalance, currentLocation, updateLocation, searchQuery, setSearchQuery }}>
      {children}
    </AuthContext.Provider>
  );
};
