import { ThemeMode, Accent } from './useTheme';

let currentMode: ThemeMode = 'system';
let currentAccent: Accent = 'indigo';

export const ThemeStorage = {
  getMode(): ThemeMode {
    return currentMode;
  },
  setMode(mode: ThemeMode): void {
    currentMode = mode;
  },
  getAccent(): Accent {
    return currentAccent;
  },
  setAccent(accent: Accent): void {
    currentAccent = accent;
  },
};
