import { create } from 'zustand';
import { User } from './types';
import { api, getAuthToken } from './api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: Boolean(getAuthToken()),
  isLoading: true,

  initAuth: async () => {
    const token = getAuthToken();
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    try {
      const user = await api.auth.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      console.warn('[useAuthStore] Failed to fetch current user profile:', err);
      // Token might be invalid or expired
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: Boolean(user) });
  },

  logout: async () => {
    await api.auth.logout();
    set({ user: null, isAuthenticated: false });
  },
}));
