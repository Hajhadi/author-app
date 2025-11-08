import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          axios.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
          setUser({ role: 'user' });
        }
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('http://YOUR_BACKEND_IP:3000/api/auth/login', { email, password });
      if (res.data.success) {
        const { token: newToken } = res.data;
        setToken(newToken);
        await AsyncStorage.setItem('token', newToken);
        axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        setUser({ role: 'user' });
        return { success: true };
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'An error occurred' };
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('token');
    delete axios.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
