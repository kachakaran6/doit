import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AuthSession } from './types';
import { overlayService } from '../../native/overlay';

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

      // Allow adequate time for Android KeyStore / SecureStore initialization on cold start or app updates (up to 4s)
      let raw: string | null = null;
      try {
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
        const readPromise = SecureStore.getItemAsync(AUTH_STORAGE_KEY).catch((e) => {
          console.warn('[AuthStorage] Primary SecureStore read error:', e);
          return null;
        });

        raw = await Promise.race([readPromise, timeoutPromise]);
      } catch (e) {
        console.warn('[AuthStorage] SecureStore race error:', e);
      }

      // If primary SecureStore read failed or was empty, check backup key
      if (!raw) {
        try {
          raw = await SecureStore.getItemAsync(BACKUP_STORAGE_KEY);
        } catch {
          // ignore
        }
      }

      // If SecureStore was wiped or KeyStore invalidated during app update, recover from Native SharedPreferences!
      if (!raw) {
        try {
          const nativeBackup = await overlayService.getSessionBackup();
          if (nativeBackup) {
            console.log('[AuthStorage] Recovered session from Native SharedPreferences backup!');
            raw = nativeBackup;
            // Restore back to SecureStore in background
            SecureStore.setItemAsync(AUTH_STORAGE_KEY, raw).catch(() => {});
            SecureStore.setItemAsync(BACKUP_STORAGE_KEY, raw).catch(() => {});
          }
        } catch (e) {
          console.warn('[AuthStorage] Native backup read error:', e);
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
        overlayService.persistSessionBackup(serialized),
        overlayService.syncAuthCredentials(
          session.accessToken,
          'https://doit.samyukt.pro/api/v1',
          null,
          session.refreshToken
        ),
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
        overlayService.persistSessionBackup(null),
        overlayService.syncAuthCredentials(null),
      ]);
    } catch (e) {
      console.warn('[AuthStorage] Failed to clear session:', e);
    }
  },
};
