'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AuthMethod, AuthMethodType, AuthResult } from '@/types/auth';
import {
  createAuthMethods,
  getAuthMethod,
  getEnabledAuthMethods,
  enableAuthMethod,
  disableAuthMethod,
  authenticate,
} from '@/services/authService';

interface AuthUser {
  id: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  methods: Map<AuthMethodType, AuthMethod>;
  enabledMethods: AuthMethod[];
  loading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  getMethod: (type: AuthMethodType) => AuthMethod | undefined;
  getEnabledMethods: () => AuthMethod[];
  enableMethod: (type: AuthMethodType) => void;
  disableMethod: (type: AuthMethodType) => void;
  authenticate: (type: AuthMethodType, credentials: unknown) => Promise<AuthResult>;
  setLoading: (loading: boolean) => void;
  loginUser: (user: AuthUser, token?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [methods, setMethods] = useState<Map<AuthMethodType, AuthMethod>>(() => createAuthMethods());
  const [enabledMethods, setEnabledMethods] = useState<AuthMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const enabled = getEnabledAuthMethods(methods);
    setEnabledMethods(enabled);
  }, [methods]);

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    const savedToken = localStorage.getItem('auth_token');
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      }
    }
  }, []);

  const getMethod = (type: AuthMethodType): AuthMethod | undefined => {
    return getAuthMethod(methods, type);
  };

  const getEnabledMethods = (): AuthMethod[] => {
    return enabledMethods;
  };

  const enableMethod = (type: AuthMethodType): void => {
    const newMethods = new Map(methods);
    enableAuthMethod(newMethods, type);
    setMethods(newMethods);
  };

  const disableMethod = (type: AuthMethodType): void => {
    const newMethods = new Map(methods);
    disableAuthMethod(newMethods, type);
    setMethods(newMethods);
  };

  const authenticateUser = async (type: AuthMethodType, credentials: unknown): Promise<AuthResult> => {
    return authenticate(methods, type, credentials);
  };

  const loginUser = useCallback((userData: AuthUser, token?: string) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('auth_token', token);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  }, []);

  const value: AuthContextType = {
    methods,
    enabledMethods,
    loading,
    isAuthenticated,
    user,
    getMethod,
    getEnabledMethods,
    enableMethod,
    disableMethod,
    authenticate: authenticateUser,
    setLoading,
    loginUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};