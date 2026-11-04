import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { ThemeMode, Accent, normalizeAccent } from './useTheme';

const THEME_MODE_KEY = 'doit.theme.mode';
const THEME_ACCENT_KEY = 'doit.theme.accent';

let inMemoryMode: ThemeMode = 'dark';
let inMemoryAccent: Accent = 'blue';

export const ThemeStorage = {
  getMode(): ThemeMode {
    return inMemoryMode;
  },

  getAccent(): Accent {
    return inMemoryAccent;
  },

  setMode(mode: ThemeMode): void {
    inMemoryMode = mode;
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(THEME_MODE_KEY, mode);
        }
      } catch {}
      return;
    }
    SecureStore.setItemAsync(THEME_MODE_KEY, mode).catch(() => {});
  },

  setAccent(accent: Accent): void {
    const normalized = normalizeAccent(accent);
    inMemoryAccent = normalized;
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(THEME_ACCENT_KEY, normalized);
        }
      } catch {}
      return;
    }
    SecureStore.setItemAsync(THEME_ACCENT_KEY, normalized).catch(() => {});
  },

  async loadPersisted(): Promise<{ mode?: ThemeMode; accent?: Accent }> {
    try {
      if (Platform.OS === 'web') {
        const savedMode = (typeof localStorage !== 'undefined' ? (localStorage.getItem(THEME_MODE_KEY) as ThemeMode) : undefined);
        const savedAccent = (typeof localStorage !== 'undefined' ? (localStorage.getItem(THEME_ACCENT_KEY) as Accent) : undefined);
        if (savedMode && ['dark', 'light', 'system'].includes(savedMode)) {
          inMemoryMode = savedMode;
        }
        if (savedAccent) {
          inMemoryAccent = normalizeAccent(savedAccent);
        }
        return { mode: inMemoryMode, accent: inMemoryAccent };
      }

      const [savedMode, savedAccent] = await Promise.all([
        SecureStore.getItemAsync(THEME_MODE_KEY).catch(() => null),
        SecureStore.getItemAsync(THEME_ACCENT_KEY).catch(() => null),
      ]);

      if (savedMode && ['dark', 'light', 'system'].includes(savedMode)) {
        inMemoryMode = savedMode as ThemeMode;
      }
      if (savedAccent) {
        inMemoryAccent = normalizeAccent(savedAccent as Accent);
      }

      return { mode: inMemoryMode, accent: inMemoryAccent };
    } catch {
      return { mode: inMemoryMode, accent: inMemoryAccent };
    }
  },
};
