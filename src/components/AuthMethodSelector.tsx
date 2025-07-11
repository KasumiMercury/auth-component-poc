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
      <label htmlFor="auth-method" className="block text-sm font-medium text-gray-700">
        認証方法
      </label>
      <select
        id="auth-method"
        value={selectedMethod}
        onChange={(e) => onMethodChange(e.target.value as AuthMethodType)}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        disabled={disabled}
      >
        {enabledMethods.map((method) => (
          <option key={method.type} value={method.type}>
            {method.name}
          </option>
        ))}
      </select>
    </div>
  );
};
