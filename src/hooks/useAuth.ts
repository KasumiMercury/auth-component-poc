import { useAuthContext } from '@/context/AuthContext';
import type { AuthMethodType, AuthResult } from '@/types/auth';

export const useAuth = () => {
  const {
    enabledMethods,
    loading,
    isAuthenticated,
    user,
    getMethod,
    getEnabledMethods,
    authenticate: contextAuthenticate,
    setLoading,
    loginUser,
    logout,
  } = useAuthContext();

  const authenticate = async (type: AuthMethodType, credentials: unknown): Promise<AuthResult> => {
    setLoading(true);

    try {
      const result = await contextAuthenticate(type, credentials);
      return result;
    } finally {
      setLoading(false);
    }
  };

  return {
    authenticate,
    loading,
    enabledMethods,
    getEnabledMethods,
    getMethod,
    isAuthenticated,
    user,
    loginUser,
    logout,
  };
};
