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
        overlayService.syncAuthCredentials(saved.accessToken, 'https://doit.samyukt.pro/api/v1', null, saved.refreshToken);
        const savedUser = saved.user as UserViewModel & { name?: string };
        const rawName = (savedUser.fullName || savedUser.name || '').trim();
        const cleanName = rawName.toLowerCase() === 'active user' ? '' : rawName;
        const initialUser: UserViewModel = {
          ...savedUser,
          fullName: cleanName || savedUser.email?.split('@')[0] || '',
        };
        set({
          user: initialUser,
          accessToken: saved.accessToken,
          refreshToken: saved.refreshToken,
          isAuthenticated: true,
        });

        // Background profile refresh from /auth/me
        http.get<any>('/auth/me').then((res) => {
          const liveUser = res?.user || res;
          if (liveUser && liveUser.id) {
            const liveName = (liveUser.name || liveUser.fullName || '').trim();
            const resolvedName = (liveName.toLowerCase() === 'active user' ? '' : liveName) || liveUser.email?.split('@')[0] || '';
            const updatedUser: UserViewModel = {
              id: liveUser.id,
              email: liveUser.email,
              fullName: resolvedName,
              avatarUrl: liveUser.avatarUrl || null,
            };
            set({ user: updatedUser });
            AuthStorage.setSession({ ...saved, user: updatedUser }).catch(() => {});
          }
        }).catch(() => {
          // Ignore network errors on background refresh
        });
      }
    } catch (e) {
      console.warn('[useAuthStore] initAuth error:', e);
    }
  },

  setSession: (session) => {
    const raw = session.user as UserViewModel & { name?: string };
    const user: UserViewModel = {
      id: raw.id,
      email: raw.email,
      fullName: raw.fullName || raw.name || raw.email?.split('@')[0] || '',
      avatarUrl: raw.avatarUrl,
    };
    const normalized = { ...session, user };
    http.setAuthToken(session.accessToken);
    AuthStorage.setSession(normalized).catch(() => {});
    overlayService.syncAuthCredentials(session.accessToken, 'https://doit.samyukt.pro/api/v1', null, session.refreshToken);
    set({
      user,
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
