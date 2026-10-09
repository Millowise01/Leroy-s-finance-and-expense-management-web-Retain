import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService } from '../services/authService';
import { AuthContext, type AuthContextValue } from './authContext';
import type { AuthStatus, AuthUser } from '../types/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let isMounted = true;

    void authService
      .restoreSession()
      .then((sessionUser) => {
        if (isMounted) {
          setUser(sessionUser);
          setStatus('authenticated');
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setStatus('unauthenticated');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      role: user?.role ?? null,
      signIn: async (input) => {
        const signedInUser = await authService.signIn(input);
        setUser(signedInUser);
        setStatus('authenticated');
      },
      signOut: async () => {
        await authService.signOut();
        setUser(null);
        setStatus('unauthenticated');
      },
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
