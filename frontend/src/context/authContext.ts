import { createContext } from 'react';
import type { AuthStatus, AuthUser, SignInInput, UserRole } from '../types/auth';

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  role: UserRole | null;
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
