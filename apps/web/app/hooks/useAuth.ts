// apps/web/app/dashboard/hooks/useAuth.ts

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          router.push('/login');
          return;
        }
      } catch {
        router.push('/login');
        return;
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, [router]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return { user, authChecked, logout };
}