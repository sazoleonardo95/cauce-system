'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-200 border-t-primary-600"></div>
        </div>
      </div>
    );
  }

  if (user) return null;

  return <LandingPage />;
}
