export type UserRole = 'user' | 'admin';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface SignInInput {
  email: string;
  password: string;
}
