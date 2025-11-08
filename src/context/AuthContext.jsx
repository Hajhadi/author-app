import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // You could add a call here to a `/api/auth/me` endpoint to validate the token and get user data
      // For now, we'll just assume the token is valid.
      setUser({ role: 'admin' }); // Placeholder user
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
      if (res.data.success) {
        const { token: newToken } = res.data;
        setToken(newToken);
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setUser({ role: 'admin' }); // Placeholder user
        return { success: true };
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'An error occurred' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
