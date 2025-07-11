'use client';

import { useAuth } from '@/hooks/useAuth';
import type { AuthMethodType } from '@/types/auth';

interface AuthMethodSelectorProps {
  selectedMethod: AuthMethodType;
  onMethodChange: (method: AuthMethodType) => void;
  disabled?: boolean;
}

export const AuthMethodSelector: React.FC<AuthMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  disabled = false,
}) => {
  const { enabledMethods } = useAuth();

  if (enabledMethods.length <= 1) {
    return null;
  }

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {enabledMethods.map((method) => (
            <button
              key={method.type}
              type="button"
              onClick={() => onMethodChange(method.type)}
              disabled={disabled}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedMethod === method.type
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {method.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
