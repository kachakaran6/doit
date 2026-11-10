import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AuthSession } from './types';

const AUTH_STORAGE_KEY = 'com.samyukt.doit.auth_session';
const BACKUP_STORAGE_KEY = 'com.samyukt.doit.auth_backup';

let inMemorySessionCache: AuthSession | null = null;

export const AuthStorage = {
  async getSession(): Promise<AuthSession | null> {
    if (inMemorySessionCache && inMemorySessionCache.accessToken) {
      return inMemorySessionCache;
    }

    try {
      if (Platform.OS === 'web') {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          inMemorySessionCache = parsed;
          return parsed;
        }
        return null;
      }

      // Allow adequate time for Android KeyStore / SecureStore initialization on cold start or app updates (up to 8s)
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000));
      const readPromise = SecureStore.getItemAsync(AUTH_STORAGE_KEY).catch((e) => {
        console.warn('[AuthStorage] Primary SecureStore read error:', e);
        return null;
      });

      let raw = await Promise.race([readPromise, timeoutPromise]);

      // If primary SecureStore read failed or was empty, check backup key
      if (!raw) {
        try {
          raw = await SecureStore.getItemAsync(BACKUP_STORAGE_KEY);
        } catch {
          // ignore
        }
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.accessToken || parsed.refreshToken)) {
          inMemorySessionCache = parsed;
          return parsed;
        }
      }

      return inMemorySessionCache;
    } catch (e) {
      console.warn('[AuthStorage] Failed to read session:', e);
      return inMemorySessionCache;
    }
  },

  async setSession(session: AuthSession): Promise<void> {
    try {
      inMemorySessionCache = session;
      const serialized = JSON.stringify(session);

      if (Platform.OS === 'web') {
        localStorage.setItem(AUTH_STORAGE_KEY, serialized);
        return;
      }

      // Persist to primary and backup key in SecureStore
      await Promise.allSettled([
        SecureStore.setItemAsync(AUTH_STORAGE_KEY, serialized),
        SecureStore.setItemAsync(BACKUP_STORAGE_KEY, serialized),
      ]);
    } catch (e) {
      console.warn('[AuthStorage] Failed to save session:', e);
    }
  },

  async clearSession(): Promise<void> {
    try {
      inMemorySessionCache = null;
      if (Platform.OS === 'web') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }
      await Promise.allSettled([
        SecureStore.deleteItemAsync(AUTH_STORAGE_KEY),
        SecureStore.deleteItemAsync(BACKUP_STORAGE_KEY),
      ]);
    } catch (e) {
      console.warn('[AuthStorage] Failed to clear session:', e);
    }
  },
};
