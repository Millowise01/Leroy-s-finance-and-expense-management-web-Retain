export type UserRole = 'USER' | 'ADMIN';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface SignInInput {
  email: string;
  password: string;
}
