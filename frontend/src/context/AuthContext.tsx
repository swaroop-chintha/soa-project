import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { UserSession, LoginRequest, RegisterRequest } from '../types/auth';
import { authService } from '../services/authService';

export interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  setUserSession: (session: UserSession | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => authService.getCurrentUser());

  useEffect(() => {
    // Keep user state in sync if another tab alters storage
    const handleStorage = () => {
      setUser(authService.getCurrentUser());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    const session: UserSession = {
      token: response.token,
      username: response.username,
      role: response.role
    };
    setUser(session);
  };

  const register = async (data: RegisterRequest) => {
    const response = await authService.register(data);
    const session: UserSession = {
      token: response.token,
      username: response.username,
      role: response.role
    };
    setUser(session);
  };

  const setUserSession = (session: UserSession | null) => {
    setUser(session);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isAuthenticated = Boolean(user && user.token);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, register, setUserSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
