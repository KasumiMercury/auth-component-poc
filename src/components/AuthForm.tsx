'use client';

import { type FormEvent, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { AuthResult } from '@/types/auth';

interface AuthFormProps {
  onAuthResult: (result: AuthResult) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthResult }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { authenticate, loading } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      onAuthResult({
        success: false,
        message: 'ユーザー名とパスワードを入力してください',
      });
      return;
    }

    const result = await authenticate('password', { username, password });
    onAuthResult(result);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          ユーザー名
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          パスワード
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  );
};
