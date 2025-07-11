'use client';

import { useState } from 'react';
import type { AuthMethodType, AuthResult } from '@/types/auth';
import { AuthForm } from './AuthForm';
import { AuthMethodSelector } from './AuthMethodSelector';
import { OAuthButton } from './OAuthButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<AuthMethodType>('password');

  const handleAuthResult = (result: AuthResult) => {
    setAuthResult(result);
    if (result.success) {
      setTimeout(() => {
        onClose();
        setAuthResult(null);
      }, 2000);
    }
  };

  const handleClose = () => {
    setAuthResult(null);
    onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">ログイン</h3>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">閉じる</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <AuthMethodSelector
              selectedMethod={selectedMethod}
              onMethodChange={setSelectedMethod}
            />
            {renderAuthMethod()}
          </div>

          {authResult && (
            <div
              className={`mt-4 p-4 rounded-md ${
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
};
