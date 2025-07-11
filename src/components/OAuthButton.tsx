'use client';

import { useAuth } from '@/hooks/useAuth';
import type { AuthResult } from '@/types/auth';

interface OAuthButtonProps {
  onAuthResult: (result: AuthResult) => void;
  provider?: string;
}

export const OAuthButton: React.FC<OAuthButtonProps> = ({ onAuthResult, provider = 'google' }) => {
  const { authenticate, loading } = useAuth();

  const handleOAuthLogin = async () => {
    const result = await authenticate('oauth', { provider });
    onAuthResult(result);
  };

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-4">OAuth認証は現在開発中です</p>
      <button
        type="button"
        onClick={handleOAuthLogin}
        disabled={loading}
        className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'OAuth認証中...' : 'OAuth認証'}
      </button>
    </div>
  );
};
