'use client';

import { useState } from 'react';
import { AuthForm } from '@/components/AuthForm';
import { AuthMethodSelector } from '@/components/AuthMethodSelector';
import { OAuthButton } from '@/components/OAuthButton';
import type { AuthMethodType, AuthResult } from '@/types/auth';

export default function AuthPage() {
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<AuthMethodType>('password');

  const handleAuthResult = (result: AuthResult) => {
    setAuthResult(result);
  };

  const renderAuthMethod = () => {
    switch (selectedMethod) {
      case 'password':
        return <AuthForm onAuthResult={handleAuthResult} />;
      case 'oauth':
        return <OAuthButton onAuthResult={handleAuthResult} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">ログイン</h2>
          <p className="mt-2 text-center text-sm text-gray-600">アカウントにログインしてください</p>
        </div>

        <div className="mt-8 space-y-6">
          <AuthMethodSelector selectedMethod={selectedMethod} onMethodChange={setSelectedMethod} />
          {renderAuthMethod()}

          {authResult && (
            <div
              className={`p-4 rounded-md ${
                authResult.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex">
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${
                      authResult.success ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {authResult.success ? '成功' : 'エラー'}
                  </p>
                  <p
                    className={`mt-2 text-sm ${
                      authResult.success ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {authResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
