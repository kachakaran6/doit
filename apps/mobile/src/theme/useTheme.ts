import { createContext, useContext } from 'react';
import {
  neutrals,
  semantics,
  accents,
  spacing,
  radius,
  typography,
  elevation,
  AccentName,
} from '@samyukt/tokens';

export type ThemeMode = 'system' | 'light' | 'dark';
export type Accent = AccentName;

export interface ThemeColors {
  // Neutrals
  bg: string;
  bgSubtle: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  overlay: string;

  // Semantics
  success: string;
  warning: string;
  danger: string;
  info: string;

  // Accent family
  accent: string;
  accentOnPrimary: string;
  accentContainer: string;
  accentSoft: string;
  accentText: string;
}

export interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  accent: Accent;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  elevation: typeof elevation;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: Accent) => void;
}

export function buildThemeColors(resolvedTheme: 'light' | 'dark', accent: Accent): ThemeColors {
  const neutral = neutrals[resolvedTheme];
  const semantic = semantics[resolvedTheme];
  const accentFamily = accents[accent];

  return {
    ...neutral,
    ...semantic,
    accent: accentFamily.primary,
    accentOnPrimary: accentFamily.onPrimary,
    accentContainer: resolvedTheme === 'dark' ? accentFamily.containerDark : accentFamily.containerLight,
    accentSoft: resolvedTheme === 'dark' ? accentFamily.softDark : accentFamily.softLight,
    accentText: resolvedTheme === 'dark' ? accentFamily.accentTextDark : accentFamily.accentTextLight,
  };
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
