'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { AuthMethod, AuthMethodType, AuthResult } from '@/types/auth';
import {
  createAuthMethods,
  getAuthMethod,
  getEnabledAuthMethods,
  enableAuthMethod,
  disableAuthMethod,
  authenticate,
} from '@/services/authService';

interface AuthContextType {
  methods: Map<AuthMethodType, AuthMethod>;
  enabledMethods: AuthMethod[];
  loading: boolean;
  getMethod: (type: AuthMethodType) => AuthMethod | undefined;
  getEnabledMethods: () => AuthMethod[];
  enableMethod: (type: AuthMethodType) => void;
  disableMethod: (type: AuthMethodType) => void;
  authenticate: (type: AuthMethodType, credentials: unknown) => Promise<AuthResult>;
  setLoading: (loading: boolean) => void;
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

  useEffect(() => {
    const enabled = getEnabledAuthMethods(methods);
    setEnabledMethods(enabled);
  }, [methods]);

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

  const value: AuthContextType = {
    methods,
    enabledMethods,
    loading,
    getMethod,
    getEnabledMethods,
    enableMethod,
    disableMethod,
    authenticate: authenticateUser,
    setLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};