'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        router.push('/login');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        
        // Set cookie if not already set
        document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;

        // Redirect based on role
        if (user.role === 'manager') {
          window.location.href = '/manager';
        } else {
          window.location.href = '/developer';
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-xl text-gray-600">Please wait...</div>
      </div>
    </div>
  );
}