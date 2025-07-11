import { useEffect, useState } from 'react';
import { AuthService } from '@/services/authService';
import type { AuthMethod, AuthMethodType, AuthResult } from '@/types/auth';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [enabledMethods, setEnabledMethods] = useState<AuthMethod[]>([]);
  const authService = AuthService.getInstance();

  useEffect(() => {
    const methods = authService.getEnabledMethods();
    setEnabledMethods(methods);
  }, [authService]);

  const authenticate = async (type: AuthMethodType, credentials: unknown): Promise<AuthResult> => {
    setLoading(true);

    try {
      const result = await authService.authenticate(type, credentials);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const getEnabledMethods = () => enabledMethods;

  const getMethod = (type: AuthMethodType) => authService.getMethod(type);

  return {
    authenticate,
    loading,
    enabledMethods,
    getEnabledMethods,
    getMethod,
  };
};
