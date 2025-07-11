'use client';

import Image from 'next/image';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthModal } from '@/components/AuthModal';
import { useAuthContext } from '@/context/AuthContext';

function HomeContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { isAuthenticated, user, loginUser, logout } = useAuthContext();

  useEffect(() => {
    const authSuccess = searchParams.get('auth_success');
    const message = searchParams.get('message');
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (authSuccess === 'true' && message) {
      setSuccessMessage(message);
      
      if (userParam) {
        try {
          const userData = JSON.parse(userParam);
          loginUser(userData, token || undefined);
        } catch (error) {
          console.error('Failed to parse user data:', error);
        }
      }

      const timer = setTimeout(() => {
        setSuccessMessage(null);
        window.history.replaceState({}, '', '/');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, loginUser]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}
      
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        {isAuthenticated && user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">ログイン中</h3>
            <p className="text-blue-800">ようこそ、{user.username}さん！</p>
            {user.email && (
              <p className="text-blue-700 text-sm mt-1">{user.email}</p>
            )}
          </div>
        )}

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-red-600 text-white gap-2 hover:bg-red-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            >
              ログアウト
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            >
              ログイン
            </button>
          )}
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="/auth"
          >
            認証ページ
          </a>
        </div>
      </main>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
