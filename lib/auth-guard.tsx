'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedEmails?: string[];
}

export function AuthGuard({ children, allowedEmails }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    } else if (user && allowedEmails) {
      const userEmail = user.email;
      const isAuthorized = allowedEmails.some(email => 
        userEmail?.toLowerCase().includes(email.toLowerCase())
      );
      
      if (!isAuthorized) {
        router.push('/admin/login');
      }
    }
  }, [user, loading, router, allowedEmails]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-gray-700">Checking access...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
