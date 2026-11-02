import { create } from 'zustand';
import { AuthSession, UserViewModel } from './types';
import { http } from '../../lib/http';
import { AuthStorage } from './auth.storage';
import { overlayService } from '../../native/overlay';

interface AuthState {
  user: UserViewModel | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  initAuth: () => Promise<void>;
  setSession: (session: AuthSession) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  initAuth: async () => {
    try {
      const saved = await AuthStorage.getSession();
      if (saved && saved.accessToken) {
        http.setAuthToken(saved.accessToken);
        overlayService.syncAuthCredentials(saved.accessToken, 'https://doit.samyukt.pro/api/v1');
        set({
          user: saved.user,
          accessToken: saved.accessToken,
          refreshToken: saved.refreshToken,
          isAuthenticated: true,
        });
      }
    } catch (e) {
      console.warn('[useAuthStore] initAuth error:', e);
    }
  },

  setSession: (session) => {
    http.setAuthToken(session.accessToken);
    AuthStorage.setSession(session).catch(() => {});
    overlayService.syncAuthCredentials(session.accessToken, 'https://doit.samyukt.pro/api/v1');
    set({
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    http.setAuthToken(null);
    AuthStorage.clearSession().catch(() => {});
    overlayService.syncAuthCredentials(null, 'https://doit.samyukt.pro/api/v1', null);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));
