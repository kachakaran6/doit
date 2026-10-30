import { create } from 'zustand';
import { AuthSession, UserViewModel } from './types';
import { http } from '../../lib/http';

interface AuthState {
  user: UserViewModel | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  setSession: (session) => {
    http.setAuthToken(session.accessToken);
    set({
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      isAuthenticated: true,
    });
  },
  logout: () => {
    http.setAuthToken(null);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));
