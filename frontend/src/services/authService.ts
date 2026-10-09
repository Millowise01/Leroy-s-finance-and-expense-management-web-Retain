import { api } from './api';
import type { AuthUser, SignInInput } from '../types/auth';

interface SessionResponse {
  user: AuthUser;
}

export const authService = {
  async restoreSession(): Promise<AuthUser> {
    const response = await api.get<SessionResponse>('/auth/me');
    return response.data.user;
  },

  async signIn(input: SignInInput): Promise<AuthUser> {
    const response = await api.post<SessionResponse>('/auth/signin', input);
    return response.data.user;
  },

  async signOut(): Promise<void> {
    await api.post('/auth/signout');
  },
};
