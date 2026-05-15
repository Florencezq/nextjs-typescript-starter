'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getMockUser,
  loginMockUser,
  logoutMockUser,
  MockUser,
} from '@/lib/mock-store';

export function useMockAuth() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setUser(getMockUser());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('word-h5-storage', refresh);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('word-h5-storage', refresh);
    };
  }, [refresh]);

  const login = useCallback((email: string) => {
    setUser(loginMockUser(email));
  }, []);

  const logout = useCallback(() => {
    logoutMockUser();
    setUser(null);
  }, []);

  return {
    ready,
    user,
    isLoggedIn: Boolean(user),
    login,
    register: login,
    logout,
  };
}
