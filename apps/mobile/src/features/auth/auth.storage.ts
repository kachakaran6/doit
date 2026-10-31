import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AuthSession } from './types';

const AUTH_STORAGE_KEY = 'com.samyukt.doit.auth_session';

export const AuthStorage = {
  async getSession(): Promise<AuthSession | null> {
    try {
      if (Platform.OS === 'web') {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      }
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000));
      const readPromise = SecureStore.getItemAsync(AUTH_STORAGE_KEY).catch((e) => {
        console.warn('[AuthStorage] SecureStore read error:', e);
        return null;
      });
      const raw = await Promise.race([readPromise, timeoutPromise]);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[AuthStorage] Failed to read session:', e);
      return null;
    }
  },

  async setSession(session: AuthSession): Promise<void> {
    try {
      const serialized = JSON.stringify(session);
      if (Platform.OS === 'web') {
        localStorage.setItem(AUTH_STORAGE_KEY, serialized);
        return;
      }
      await SecureStore.setItemAsync(AUTH_STORAGE_KEY, serialized);
    } catch (e) {
      console.warn('[AuthStorage] Failed to save session:', e);
    }
  },

  async clearSession(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }
      await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('[AuthStorage] Failed to clear session:', e);
    }
  },
};
