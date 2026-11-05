import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentColor = 'blue' | 'violet' | 'green' | 'orange' | 'rose';
export type Density = 'comfortable' | 'compact';

interface ThemeState {
  mode: ThemeMode;
  accent: AccentColor;
  density: Density;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  setDensity: (density: Density) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: (localStorage.getItem('doit_theme_mode') as ThemeMode) || 'dark',
  accent: (localStorage.getItem('doit_theme_accent') as AccentColor) || 'blue',
  density: (localStorage.getItem('doit_density') as Density) || 'comfortable',

  setMode: (mode) => {
    localStorage.setItem('doit_theme_mode', mode);
    set({ mode });
    get().initTheme();
  },

  setAccent: (accent) => {
    localStorage.setItem('doit_theme_accent', accent);
    set({ accent });
    get().initTheme();
  },

  setDensity: (density) => {
    localStorage.setItem('doit_density', density);
    set({ density });
    get().initTheme();
  },

  initTheme: () => {
    const { mode, accent, density } = get();
    const root = document.documentElement;

    // Apply mode
    const isDark =
      mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply accent
    root.setAttribute('data-accent', accent);

    // Apply density
    root.setAttribute('data-density', density);
  },
}));
