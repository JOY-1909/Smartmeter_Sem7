import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 'USR-CON-8842',
  name: 'Rajesh Kumar',
  email: 'consumer@gridsense.io',
  role: 'consumer', // 'operator' | 'consumer'
  meterId: 'MTR-IND-KA-0942',
  accountNumber: 'CA-993821098'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('gridsense_user');
      return savedUser ? JSON.parse(savedUser) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('gridsense_token') || 'mock_jwt_session_token');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('gridsense_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gridsense_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('gridsense_token', token);
    } else {
      localStorage.removeItem('gridsense_token');
    }
  }, [token]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await loginUser(email, password);
      if (response.success) {
        setUser(response.user);
        setToken(response.token);
        return { success: true };
      }
      return { success: false, message: response.message || 'Authentication failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Login error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = (newRole) => {
    if (newRole === 'operator') {
      setUser({
        id: 'USR-OP-001',
        name: 'Grid Operations Center',
        email: 'operator@gridsense.io',
        role: 'operator',
        meterId: 'MTR-IND-KA-0942',
        accountNumber: 'SUBSTATION-SOUTH-11'
      });
    } else {
      setUser(DEFAULT_USER);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('gridsense_user');
    localStorage.removeItem('gridsense_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      isOperator: user?.role === 'operator',
      isConsumer: user?.role === 'consumer',
      isLoading,
      login,
      logout,
      switchRole
    }}>
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
